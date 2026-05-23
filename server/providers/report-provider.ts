import { createMockAiProvider } from "@/server/providers/mock-ai";
import { resolveOpenAiTimeoutMs } from "@/server/providers/openai-json";
import { createOpenAiReportProvider } from "@/server/providers/openai-report";
import { assertReportIsSafe } from "@/server/reports/safety";
import type { AiReportPayload } from "@/server/ai/schemas";
import type { AiProvider, GenerateReportInput } from "@/server/providers/types";

type ProviderEnv = Partial<Record<string, string | undefined>>;

export type ReportRunResult =
  | {
      ok: true;
      report: AiReportPayload;
    }
  | {
      ok: false;
      recoverable: true;
      message: string;
      warnings: string[];
    };

export function selectReportProvider(env: ProviderEnv = process.env): {
  name: "mock" | "openai";
  provider?: AiProvider;
  unavailableReason?: string;
} {
  const providerName = env.AI_REPORT_PROVIDER === "openai" ? "openai" : "mock";

  if (providerName === "mock") {
    return { name: "mock", provider: createMockAiProvider() };
  }

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_REPORT_MODEL;
  if (!apiKey || !model) {
    return {
      name: "openai",
      unavailableReason:
        "OpenAI report generation is not configured. Set OPENAI_API_KEY and OPENAI_REPORT_MODEL on the server.",
    };
  }

  return {
    name: "openai",
    provider: createOpenAiReportProvider({
      apiKey,
      model,
      timeoutMs: resolveOpenAiTimeoutMs(env.OPENAI_REQUEST_TIMEOUT_MS),
    }),
  };
}

export async function runReportGeneration(
  input: GenerateReportInput,
  env: ProviderEnv = process.env,
): Promise<ReportRunResult> {
  const selected = selectReportProvider(env);

  if (!selected.provider) {
    return {
      ok: false,
      recoverable: true,
      message: selected.unavailableReason ?? "AI report provider is unavailable.",
      warnings: [selected.unavailableReason ?? "AI report provider is unavailable."],
    };
  }

  return runReportGenerationWithProvider(selected.provider, input);
}

export async function runReportGenerationWithProvider(
  provider: AiProvider,
  input: GenerateReportInput,
): Promise<ReportRunResult> {
  try {
    const report = await provider.generateReport(input);
    return {
      ok: true,
      report: assertReportIsSafe(report),
    };
  } catch (error) {
    return {
      ok: false,
      recoverable: true,
      message:
        error instanceof Error
          ? `AI report generation invalid or unavailable: ${error.message}`
          : "AI report generation invalid or unavailable.",
      warnings: ["AI report generation failed safely. You can retry after checking confirmed rows."],
    };
  }
}
