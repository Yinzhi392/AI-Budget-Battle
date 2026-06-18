"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { runExtraction } from "@/server/providers/ai-provider";
import { readAuthCookieState } from "@/server/auth/session";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";
import { recoverUploadAnalysisSession } from "@/server/upload/session-recovery";
import {
  validateCategoryTotalInput,
  validateManualTransactionInput,
  validateScreenshotMetadataInput,
} from "@/server/upload/validation";
import type {
  SaveCategoryTotalHintInput,
  SaveConfirmedTransactionInput,
} from "@/server/providers/types";
import type { UploadedImageMetadata } from "@/types/domain";

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

export async function saveUploadInputs(formData: FormData) {
  const cookieStore = await cookies();
  const setup = readSetupCookieState(cookieStore);
  const redirectTarget = getSetupRedirectTarget(setup);
  const auth = readAuthCookieState(cookieStore);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const analysisSessionId = await recoverUploadAnalysisSession({
    cookieStore,
    persistence: mockPersistence,
    setup,
    userId: auth.userId,
  });
  if (!analysisSessionId) {
    redirect("/battle/period");
  }

  const screenshots = getScreenshotMetadata(formData, analysisSessionId);
  const manualTransactions = parseJsonArray<SaveConfirmedTransactionInput>(
    formData.get("manualTransactions"),
    validateManualTransactionInput,
  );
  const categoryTotals = parseJsonArray<SaveCategoryTotalHintInput>(
    formData.get("categoryTotals"),
    validateCategoryTotalInput,
  );

  if (screenshots.length > 0) {
    await mockPersistence.saveUploadedImages(analysisSessionId, screenshots);
    const extraction = await runExtraction({
      analysisSessionId,
      uploadedImages: screenshots,
    });

    if (extraction.ok) {
      await mockPersistence.saveExtractionOutput(analysisSessionId, extraction.output);
    } else if (manualTransactions.length === 0 && categoryTotals.length === 0) {
      redirect("/battle/upload?extraction=failed");
    }
  }

  if (manualTransactions.length > 0) {
    await mockPersistence.saveConfirmedTransactions(analysisSessionId, manualTransactions);
  }

  if (categoryTotals.length > 0) {
    await mockPersistence.saveCategoryTotalHints(analysisSessionId, categoryTotals);
  }

  redirect("/battle/confirm");
}

function getScreenshotMetadata(formData: FormData, analysisSessionId: string) {
  const sourceType = String(formData.get("sourceType") ?? "monthly_summary");
  const files = formData
    .getAll("screenshots")
    .filter((file): file is File => file instanceof File && file.size > 0);

  return files.map((file, index): UploadedImageMetadata => {
    const metadata = validateScreenshotMetadataInput({
      sourceType,
      fileName: file.name,
      sizeBytes: file.size,
    });

    return {
      id: `upload_${index + 1}`,
      analysisSessionId,
      ...metadata,
      temporaryStorageUrl: `mock://upload/${analysisSessionId}/${encodeURIComponent(file.name)}`,
      expiresAt: new Date(Date.now() + oneDayInMilliseconds).toISOString(),
      createdAt: new Date().toISOString(),
    };
  });
}

function parseJsonArray<T>(
  value: FormDataEntryValue | null,
  validator: (input: Record<string, unknown>) => T,
) {
  if (typeof value !== "string" || !value) {
    return [];
  }

  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((item) => validator(item as Record<string, unknown>));
}
