import { extractionOutputSchema } from "@/server/ai/schemas";
import {
  requestValidatedOpenAiJson,
  type OpenAiResponsesClient,
} from "@/server/providers/openai-json";
import type { AiProvider } from "@/server/providers/types";

type OpenAiExtractionConfig = {
  apiKey: string;
  model: string;
  timeoutMs: number;
  client?: OpenAiResponsesClient;
};

export function createOpenAiExtractionProvider(config: OpenAiExtractionConfig): AiProvider {
  return {
    async extractTransactions(input) {
      const client = await resolveClient(config);
      return requestValidatedOpenAiJson({
        client,
        model: config.model,
        schema: extractionOutputSchema,
        timeoutMs: config.timeoutMs,
        repairInstruction:
          "Repair the extraction output so it exactly matches the schema with transactionCandidates, aggregateCandidates, and warnings.",
        messages: [
          {
            role: "system",
            content:
              [
                "Extract student spending data from bill screenshots.",
                "Return only strict JSON with transactionCandidates, aggregateCandidates, and warnings.",
                "Detailed transaction rows must use isEstimate false.",
                "Monthly or category summary rows must use aggregateCandidates with isEstimate true.",
                "Preserve sourceType, sourceImageId, confidence, possible duplicates, and overlap metadata.",
              ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              analysisSessionId: input.analysisSessionId,
              uploadedImages: input.uploadedImages.map((image) => ({
                id: image.id,
                sourceType: image.sourceType,
                originalName: image.originalName,
                temporaryStorageUrl: image.temporaryStorageUrl,
              })),
            }),
          },
        ],
      });
    },

    async generateReport() {
      throw new Error("OpenAI extraction provider does not implement report generation.");
    },
  };
}

async function resolveClient(config: OpenAiExtractionConfig): Promise<OpenAiResponsesClient> {
  if (config.client) {
    return config.client;
  }

  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey: config.apiKey }) as OpenAiResponsesClient;
}
