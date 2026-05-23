import { describe, expect, it } from "vitest";
import {
  extractionOutputSchema,
  extractionTransactionCandidateSchema,
} from "@/server/ai/schemas";
import {
  runExtraction,
  runExtractionWithProvider,
  selectExtractionProvider,
} from "@/server/providers/ai-provider";
import { createMockAiProvider } from "@/server/providers/mock-ai";
import { resolveOpenAiTimeoutMs, type OpenAiResponsesClient } from "@/server/providers/openai-json";
import { createOpenAiExtractionProvider } from "@/server/providers/openai-extraction";
import type { UploadedImageMetadata } from "@/types/domain";

const baseImage = {
  id: "image_1",
  analysisSessionId: "analysis_1",
  originalName: "alipay-monthly.png",
  sizeBytes: 42000,
  temporaryStorageUrl: "mock://upload/analysis_1/alipay-monthly.png",
  ocrStatus: "pending",
  expiresAt: "2026-05-22T00:00:00.000Z",
  createdAt: "2026-05-21T00:00:00.000Z",
} satisfies Omit<UploadedImageMetadata, "sourceType">;

describe("Task 7 AI extraction boundary", () => {
  it("selects mock extraction by default", () => {
    const selected = selectExtractionProvider({});

    expect(selected.name).toBe("mock");
    expect(selected.provider).toBeDefined();
    expect(selected.unavailableReason).toBeUndefined();
  });

  it("returns a recoverable unavailable result when OpenAI is requested without server config", async () => {
    const result = await runExtraction(
      {
        analysisSessionId: "analysis_1",
        uploadedImages: [{ ...baseImage, sourceType: "single_transaction" }],
      },
      { AI_PROVIDER: "openai" },
    );

    if (result.ok) {
      throw new Error("Expected extraction to fail without OpenAI config.");
    }
    expect(result.recoverable).toBe(true);
    expect(result.message).toMatch(/OpenAI extraction is not configured/);
  });

  it("does not use public OpenAI env vars for server-side provider selection", async () => {
    const result = await runExtraction(
      {
        analysisSessionId: "analysis_1",
        uploadedImages: [{ ...baseImage, sourceType: "single_transaction" }],
      },
      {
        AI_PROVIDER: "openai",
        NEXT_PUBLIC_OPENAI_API_KEY: "public-key-must-be-ignored",
        OPENAI_EXTRACTION_MODEL: "gpt-test",
      },
    );

    if (result.ok) {
      throw new Error("Expected extraction to fail without server-only OPENAI_API_KEY.");
    }
    expect(result.message).toMatch(/OPENAI_API_KEY/);

    const selected = selectExtractionProvider({
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "server-secret",
      OPENAI_EXTRACTION_MODEL: "gpt-test",
      NEXT_PUBLIC_OPENAI_API_KEY: "public-key-must-be-ignored",
    });
    expect(selected.name).toBe("openai");
    expect(selected.provider).toBeDefined();
    expect(JSON.stringify(selected)).not.toContain("server-secret");
  });

  it("mock transaction extraction classifies 一点点 as milk tea and validates through Zod", async () => {
    const output = await createMockAiProvider().extractTransactions({
      analysisSessionId: "analysis_1",
      uploadedImages: [
        {
          ...baseImage,
          sourceType: "single_transaction",
          originalName: "一点点-10元.png",
        },
      ],
    });

    const parsed = extractionOutputSchema.parse(output);
    expect(parsed.transactionCandidates[0]).toMatchObject({
      category: "milk_tea",
      sourceType: "single_transaction",
      isEstimate: false,
    });
    expect(extractionTransactionCandidateSchema.parse(parsed.transactionCandidates[0]).confidence).toBeGreaterThan(0);
  });

  it("mock monthly summary extraction produces aggregate estimate candidates", async () => {
    const output = await createMockAiProvider().extractTransactions({
      analysisSessionId: "analysis_1",
      uploadedImages: [{ ...baseImage, sourceType: "monthly_summary" }],
    });

    const parsed = extractionOutputSchema.parse(output);
    expect(parsed.transactionCandidates).toHaveLength(0);
    expect(parsed.aggregateCandidates[0]).toMatchObject({
      sourceType: "monthly_summary",
      isEstimate: true,
      possibleOverlap: true,
    });
  });

  it("mock mixed-source extraction preserves dedupe and overlap metadata", async () => {
    const output = await createMockAiProvider().extractTransactions({
      analysisSessionId: "analysis_1",
      uploadedImages: [
        { ...baseImage, id: "monthly_1", sourceType: "monthly_summary" },
        {
          ...baseImage,
          id: "wechat_1",
          sourceType: "representative_daily",
          originalName: "wechat-day-一点点.png",
        },
      ],
    });

    const parsed = extractionOutputSchema.parse(output);
    expect(parsed.aggregateCandidates[0]?.overlapGroupId).toBe("mixed-source-1");
    expect(parsed.transactionCandidates[0]).toMatchObject({
      dedupeKey: expect.stringContaining("wechat_1"),
      overlapGroupId: "mixed-source-1",
      possibleDuplicate: true,
    });
  });

  it("invalid provider output is rejected as a recoverable extraction failure", async () => {
    const result = await runExtractionWithProvider(
      {
        async extractTransactions() {
          return { transactionCandidates: [{ amount: -1 }], aggregateCandidates: [], warnings: [] };
        },
        async generateReport() {
          throw new Error("not used");
        },
      },
      {
        analysisSessionId: "analysis_1",
        uploadedImages: [{ ...baseImage, sourceType: "single_transaction" }],
      },
    );

    if (result.ok) {
      throw new Error("Expected invalid extraction output to fail.");
    }
    expect(result.recoverable).toBe(true);
    expect(result.message).toMatch(/invalid/i);
  });

  it("OpenAI extraction retries invalid structured output once and validates the repair", async () => {
    const calls: Array<{ model: string; input: Array<{ role: string; content: string }> }> = [];
    const validOutput = {
      transactionCandidates: [
        {
          amount: 10,
          currency: "CNY",
          category: "milk_tea",
          merchant: "一点点",
          transactionTime: "2026-05-21T12:00:00.000Z",
          sourceImageId: "image_1",
          sourceType: "single_transaction",
          confidence: 0.88,
          isEstimate: false,
        },
      ],
      aggregateCandidates: [],
      warnings: ["repaired"],
    };
    const fakeClient: OpenAiResponsesClient = {
      responses: {
        async create(input) {
          calls.push(input);
          return {
            output_text:
              calls.length === 1
                ? JSON.stringify({ transactionCandidates: [{ amount: -1 }], aggregateCandidates: [], warnings: [] })
                : JSON.stringify(validOutput),
          };
        },
      },
    };

    const provider = createOpenAiExtractionProvider({
      apiKey: "server-secret",
      model: "gpt-test",
      timeoutMs: 5_000,
      client: fakeClient,
    });

    const result = await runExtractionWithProvider(provider, {
      analysisSessionId: "analysis_1",
      uploadedImages: [{ ...baseImage, sourceType: "single_transaction" }],
    });

    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(calls).toHaveLength(2);
    expect(calls[1]?.input.at(-1)?.content).toContain("previous output was invalid");
    expect(result.output.transactionCandidates[0]?.category).toBe("milk_tea");
  });

  it("OpenAI extraction timeout is returned as a recoverable failure", async () => {
    const fakeClient: OpenAiResponsesClient = {
      responses: {
        async create() {
          await new Promise((resolve) => setTimeout(resolve, 20));
          return { output_text: "{}" };
        },
      },
    };
    const provider = createOpenAiExtractionProvider({
      apiKey: "server-secret",
      model: "gpt-test",
      timeoutMs: 1,
      client: fakeClient,
    });

    const result = await runExtractionWithProvider(provider, {
      analysisSessionId: "analysis_1",
      uploadedImages: [{ ...baseImage, sourceType: "single_transaction" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/timed out/i);
    }
  });

  it("resolves safe OpenAI timeout defaults from server env", () => {
    expect(resolveOpenAiTimeoutMs(undefined)).toBe(20_000);
    expect(resolveOpenAiTimeoutMs("2500")).toBe(2500);
    expect(resolveOpenAiTimeoutMs("5")).toBe(20_000);
    expect(resolveOpenAiTimeoutMs("not-a-number")).toBe(20_000);
  });
});
