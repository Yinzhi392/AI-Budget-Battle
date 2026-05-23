import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { GenerateReportForm } from "@/app/battle/generating/generate-report-form";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { shouldReuseExistingReport } from "@/server/reports/staleness";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";

export default async function GeneratingPage() {
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

  const snapshot = await mockPersistence.getAnalysisSnapshot(analysisSessionId);
  if (!snapshot) {
    redirect("/battle/upload");
  }

  if (shouldReuseExistingReport(snapshot)) {
    redirect(`/battle/result/${analysisSessionId}`);
  }

  const hasConfirmedInput =
    snapshot.confirmedTransactions.length > 0 ||
    snapshot.confirmedAggregates.length > 0;
  if (!hasConfirmedInput) {
    redirect("/battle/confirm");
  }

  return (
    <BattleShell
      content={routePages.generating}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <GenerateReportForm />
    </BattleShell>
  );
}
