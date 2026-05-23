"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateConfirmationRows } from "@/server/confirm/validation";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";
import type { ConfirmationRowInput } from "@/server/confirm/validation";

export type ConfirmRowsActionState = {
  error?: string;
};

export async function confirmRowsAction(
  _previousState: ConfirmRowsActionState,
  formData: FormData,
): Promise<ConfirmRowsActionState> {
  const cookieStore = await cookies();
  const setup = readSetupCookieState(cookieStore);
  const redirectTarget = getSetupRedirectTarget(setup);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const analysisSessionId = setup.analysisSessionId;
  if (!analysisSessionId) {
    redirect("/battle/period");
  }

  try {
    const rows = parseRows(formData.get("rows"));
    const validated = validateConfirmationRows(rows);
    await mockPersistence.saveConfirmedTransactions(
      analysisSessionId,
      validated.transactions,
    );
    await mockPersistence.saveConfirmedAggregates(
      analysisSessionId,
      validated.aggregates,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "确认数据无效",
    };
  }

  redirect("/battle/generating");
}

function parseRows(value: FormDataEntryValue | null): ConfirmationRowInput[] {
  if (typeof value !== "string" || !value) {
    throw new Error("请至少确认一条交易或估算汇总");
  }

  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("确认数据无效");
  }

  return parsed as ConfirmationRowInput[];
}
