import { aiReportSchema, type AiReportPayload } from "@/server/ai/schemas";

const unsafeRoastPatterns = [
  /穷鬼/,
  /贫穷/,
  /底层/,
  /废物/,
  /垃圾/,
  /活该/,
  /没救/,
  /丑/,
  /胖/,
  /性别/,
  /学校.*差/,
  /校.*垃圾/,
  /借贷/,
  /贷款/,
  /投资建议/,
  /医疗/,
  /法律/,
  /税务/,
];

const forbiddenBenchmarkPatterns = [
  /真实排名/,
  /全校/,
  /全国/,
  /第\s*\d+\s*名/,
  /超过了?.*\d+\s*%/,
  /前\s*\d+\s*%/,
  /percentile/i,
  /top\s*\d+\s*%/i,
  /real\s+ranking/i,
];

export function containsUnsafeRoast(text: string) {
  return unsafeRoastPatterns.some((pattern) => pattern.test(text));
}

export function containsForbiddenBenchmarkClaim(text: string) {
  return forbiddenBenchmarkPatterns.some((pattern) => pattern.test(text));
}

export function assertReportIsSafe(report: unknown): AiReportPayload {
  const parsed = aiReportSchema.parse(report);

  if (containsUnsafeRoast(parsed.roast.short)) {
    throw new Error("Unsafe roast output was blocked.");
  }

  for (const insight of parsed.benchmarkInsights) {
    if (containsForbiddenBenchmarkClaim(insight.text)) {
      throw new Error("Benchmark wording must not claim 真实排名, 百分位, percentile, or 全校 ranking.");
    }
  }

  return parsed;
}
