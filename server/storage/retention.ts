import type { UploadedImageMetadata } from "@/types/domain";

export type ScreenshotRetentionStatus = "temporary" | "deletable_after_analysis" | "expired";

export type ScreenshotRetentionResult = {
  imageId: string;
  originalName: string;
  status: ScreenshotRetentionStatus;
  expiresAt: string;
  retainedAsHistory: false;
};

export function evaluateScreenshotRetention(
  image: UploadedImageMetadata,
  input: {
    now: string;
    analysisCompleted: boolean;
  },
): ScreenshotRetentionResult {
  const nowMs = Date.parse(input.now);
  const expiresAtMs = Date.parse(image.expiresAt);
  const createdAtMs = Date.parse(image.createdAt);
  const maxRetentionMs = createdAtMs + 24 * 60 * 60 * 1000;
  const isExpired = nowMs >= Math.min(expiresAtMs, maxRetentionMs);

  return {
    imageId: image.id,
    originalName: image.originalName,
    status: isExpired
      ? "expired"
      : input.analysisCompleted
        ? "deletable_after_analysis"
        : "temporary",
    expiresAt: new Date(Math.min(expiresAtMs, maxRetentionMs)).toISOString(),
    retainedAsHistory: false,
  };
}
