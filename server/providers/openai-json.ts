import type { z } from "zod";

export type OpenAiMessage = {
  role: "system" | "user";
  content: string;
};

export type OpenAiTextResponse = {
  output_text?: string | null;
};

export type OpenAiResponsesClient = {
  responses: {
    create(input: { model: string; input: OpenAiMessage[] }): Promise<OpenAiTextResponse>;
  };
};

type RequestValidatedOpenAiJsonInput<T> = {
  client: OpenAiResponsesClient;
  model: string;
  messages: OpenAiMessage[];
  repairInstruction: string;
  schema: z.ZodType<T>;
  timeoutMs: number;
};

const defaultTimeoutMs = 20_000;
const maxInvalidPreviewLength = 1_800;

export function resolveOpenAiTimeoutMs(value?: string): number {
  if (!value) {
    return defaultTimeoutMs;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1_000 || parsed > 120_000) {
    return defaultTimeoutMs;
  }

  return Math.trunc(parsed);
}

export async function requestValidatedOpenAiJson<T>({
  client,
  model,
  messages,
  repairInstruction,
  schema,
  timeoutMs,
}: RequestValidatedOpenAiJsonInput<T>): Promise<T> {
  let lastInvalidText = "";
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await withTimeout(
      client.responses.create({
        model,
        input: attempt === 0 ? messages : buildRepairMessages(messages, repairInstruction, lastInvalidText),
      }),
      timeoutMs,
    );
    const text = response.output_text;
    if (!text) {
      lastError = new Error("OpenAI returned no text output.");
      lastInvalidText = "";
    } else {
      try {
        return schema.parse(JSON.parse(text));
      } catch (error) {
        lastError = error;
        lastInvalidText = text.slice(0, maxInvalidPreviewLength);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("OpenAI returned invalid structured output.");
}

function buildRepairMessages(
  messages: OpenAiMessage[],
  repairInstruction: string,
  lastInvalidText: string,
): OpenAiMessage[] {
  return [
    ...messages,
    {
      role: "user",
      content: [
        repairInstruction,
        "The previous output was invalid. Return only valid JSON. Do not wrap it in markdown.",
        lastInvalidText ? `Previous invalid output preview: ${lastInvalidText}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`OpenAI request timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
