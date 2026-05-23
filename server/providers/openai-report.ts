import { aiReportSchema } from "@/server/ai/schemas";
import {
  requestValidatedOpenAiJson,
  type OpenAiResponsesClient,
} from "@/server/providers/openai-json";
import type { AiProvider, GenerateReportInput } from "@/server/providers/types";

type OpenAiReportProviderConfig = {
  apiKey: string;
  model: string;
  timeoutMs: number;
  client?: OpenAiResponsesClient;
};

export function createOpenAiReportProvider(
  config: OpenAiReportProviderConfig,
): AiProvider {
  return {
    async extractTransactions() {
      throw new Error("OpenAI report provider does not implement extraction.");
    },

    async generateReport(input: GenerateReportInput) {
      const client = await resolveClient(config);
      return requestValidatedOpenAiJson({
        client,
        model: config.model,
        schema: aiReportSchema,
        timeoutMs: config.timeoutMs,
        repairInstruction:
          "Repair the report output so it exactly matches the AI Budget Battle report schema.",
        messages: [
          {
            role: "system",
            content:
              [
                "Return only JSON matching the AI Budget Battle report schema.",
                "Use Chinese-first cyber wrapped wording.",
                "Use benchmark wording, never real rankings or percentiles.",
                "Keep roast safe, non-discriminatory, and free of medical, legal, tax, investment, or lending advice.",
                "Treat confirmed aggregate rows as estimated data, not exact accounting.",
              ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              region: input.region,
              currency: input.currency,
              periodStart: input.periodStart,
              periodEnd: input.periodEnd,
              confirmedTransactions: input.confirmedTransactions,
              confirmedAggregates: input.confirmedAggregates,
            }),
          },
        ],
      });
    },
  };
}

async function resolveClient(config: OpenAiReportProviderConfig): Promise<OpenAiResponsesClient> {
  if (config.client) {
    return config.client;
  }

  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey: config.apiKey }) as OpenAiResponsesClient;
}
