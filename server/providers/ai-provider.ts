import { extractionOutputSchema } from "@/server/ai/schemas";
import { createMockAiProvider } from "@/server/providers/mock-ai";
import { resolveOpenAiTimeoutMs } from "@/server/providers/openai-json";
import { createOpenAiExtractionProvider } from "@/server/providers/openai-extraction";
import type { AiProvider, ExtractTransactionsInput } from "@/server/providers/types";
import type { ExtractionOutputPayload } from "@/server/ai/schemas";

type ProviderEnv = Partial<Record<string, string | undefined>>;

export type ExtractionRunResult =
  | {
      ok: true;
      output: ExtractionOutputPayload;
    }
  | {
      ok: false;
      recoverable: true;
      message: string;
      warnings: string[];
    };

export function selectExtractionProvider(env: ProviderEnv = process.env): {
  name: "mock" | "openai";
  provider?: AiProvider;
  unavailableReason?: string;
} {
  const providerName = env.AI_PROVIDER === "openai" ? "openai" : "mock";

  if (providerName === "mock") {
    return { name: "mock", provider: createMockAiProvider() };
  }

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_EXTRACTION_MODEL;
  if (!apiKey || !model) {
    return {
      name: "openai",
      unavailableReason: "OpenAI extraction is not configured. Set OPENAI_API_KEY and OPENAI_EXTRACTION_MODEL on the server.",
    };
  }

  return {
    name: "openai",
    provider: createOpenAiExtractionProvider({
      apiKey,
      model,
      timeoutMs: resolveOpenAiTimeoutMs(env.OPENAI_REQUEST_TIMEOUT_MS),
    }),
  };
}

export async function runExtraction(
  input: ExtractTransactionsInput,
  env: ProviderEnv = process.env,
): Promise<ExtractionRunResult> {
  const selected = selectExtractionProvider(env);

  if (!selected.provider) {
    return {
      ok: false,
      recoverable: true,
      message: selected.unavailableReason ?? "AI extraction provider is unavailable.",
      warnings: [selected.unavailableReason ?? "AI extraction provider is unavailable."],
    };
  }

  return runExtractionWithProvider(selected.provider, input);
}

export async function runExtractionWithProvider(
  provider: AiProvider,
  input: ExtractTransactionsInput,
): Promise<ExtractionRunResult> {
  try {
    const output = await provider.extractTransactions(input);
    return {
      ok: true,
      output: extractionOutputSchema.parse(output),
    };
  } catch (error) {
    return {
      ok: false,
      recoverable: true,
      message: error instanceof Error ? `AI extraction invalid or unavailable: ${error.message}` : "AI extraction invalid or unavailable.",
      warnings: ["AI extraction invalid or unavailable. Manual input and category totals remain available."],
    };
  }
}
