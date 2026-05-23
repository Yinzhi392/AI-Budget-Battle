"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { runReportGeneration } from "@/server/providers/report-provider";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { evaluateAuthGate } from "@/server/auth/gates";
import { readAuthCookieState } from "@/server/auth/session";
import { isReportStaleForConfirmedInput } from "@/server/reports/staleness";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";

export type GenerateReportActionState = {
  error?: string;
  loginRequired?: boolean;
};

export async function generateReportAction(): Promise<GenerateReportActionState> {
  const cookieStore = await cookies();
  const setup = readSetupCookieState(cookieStore);
  const auth = readAuthCookieState(cookieStore);
  const redirectTarget = getSetupRedirectTarget(setup);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const analysisSessionId = setup.analysisSessionId;
  if (!analysisSessionId) {
    redirect("/battle/period");
  }

  const snapshot = await mockPersistence.getAnalysisSnapshot(analysisSessionId);
  if (!snapshot) {
    redirect("/battle/upload");
  }

  const hasConfirmedInput =
    snapshot.confirmedTransactions.length > 0 ||
    snapshot.confirmedAggregates.length > 0;

  if (!hasConfirmedInput) {
    redirect("/battle/confirm");
  }

  const isReplacingStaleReport = isReportStaleForConfirmedInput(snapshot);

  if (setup.anonymousSessionId && !isReplacingStaleReport) {
    const anonymousReportCount = await mockPersistence.getGeneratedReportCountForAnonymousSession(
      setup.anonymousSessionId,
    );
    const gate = evaluateAuthGate({
      action: "generate_repeated_report",
      userId: auth.userId,
      anonymousReportCount,
    });
    if (gate.loginRequired) {
      return {
        error: gate.message,
        loginRequired: true,
      };
    }
  }

  const result = await runReportGeneration({
    analysisSessionId,
    region: snapshot.analysisSession.region,
    currency: snapshot.analysisSession.currency,
    periodStart: snapshot.analysisSession.periodStart,
    periodEnd: snapshot.analysisSession.periodEnd,
    confirmedTransactions: snapshot.confirmedTransactions,
    confirmedAggregates: snapshot.confirmedAggregates,
  });

  if (!result.ok) {
    return {
      error: result.message,
    };
  }

  await mockPersistence.saveReport(analysisSessionId, result.report);
  redirect(`/battle/result/${analysisSessionId}`);
}
