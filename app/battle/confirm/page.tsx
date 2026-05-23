import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { ConfirmationForm } from "@/app/battle/confirm/confirmation-form";
import { mockPersistence } from "@/server/providers/mock-singleton";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";
import { getCategoryOptionsForRegion } from "@/server/upload/validation";
import type { AnalysisSnapshot } from "@/types/domain";
import type { ConfirmationRowInput } from "@/server/confirm/validation";

export default async function ConfirmPage() {
  const cookieStore = await cookies();
  const setup = readSetupCookieState(cookieStore);
  const redirectTarget = getSetupRedirectTarget(setup);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const analysisSessionId = setup.analysisSessionId;
  if (!analysisSessionId || !setup.region || !setup.currency) {
    redirect("/battle/period");
  }

  const snapshot = await mockPersistence.getAnalysisSnapshot(analysisSessionId);
  if (!snapshot) {
    redirect("/battle/upload");
  }

  const initialRows = buildInitialRows(snapshot);
  const categories = getCategoryOptionsForRegion(setup.region);

  return (
    <BattleShell
      content={routePages.confirm}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <ConfirmationForm
        initialRows={initialRows}
        currency={setup.currency}
        categories={categories}
      />
    </BattleShell>
  );
}

function buildInitialRows(snapshot: AnalysisSnapshot): ConfirmationRowInput[] {
  const manualTransactionRows: ConfirmationRowInput[] = snapshot.confirmedTransactions.map(
    (transaction) => ({
      id: transaction.id,
      kind: "transaction",
      accepted: true,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      merchant: transaction.merchant,
      note: transaction.note,
      transactionTime: transaction.transactionTime,
      sourceImageId: transaction.sourceImageId,
      source: transaction.source,
      confidence: transaction.confidence,
    }),
  );

  const extractedTransactionRows: ConfirmationRowInput[] =
    snapshot.extractionOutput?.transactionCandidates.map((candidate, index) => ({
      id: `extracted_tx_${index + 1}`,
      kind: "transaction",
      accepted: true,
      amount: candidate.amount,
      currency: candidate.currency,
      category: candidate.category,
      merchant: candidate.merchant,
      note: candidate.note,
      transactionTime: candidate.transactionTime,
      sourceImageId: candidate.sourceImageId,
      sourceType: candidate.sourceType,
      sourcePlatform: candidate.sourcePlatform,
      dedupeKey: candidate.dedupeKey,
      overlapGroupId: candidate.overlapGroupId,
      possibleDuplicate: candidate.possibleDuplicate,
      source: "mock_ai",
      confidence: candidate.confidence,
      isEstimate: false,
    })) ?? [];

  const categoryHintRows: ConfirmationRowInput[] = snapshot.categoryTotalHints.map((hint) => ({
    id: hint.id,
    kind: "aggregate",
    accepted: true,
    amount: hint.amount,
    currency: hint.currency,
    category: hint.category,
    periodLabel: hint.periodLabel,
    note: hint.note,
    source: "manual",
    confidence: hint.confidence,
    isEstimate: true,
  }));

  const extractedAggregateRows: ConfirmationRowInput[] =
    snapshot.extractionOutput?.aggregateCandidates.map((candidate, index) => ({
      id: `extracted_aggregate_${index + 1}`,
      kind: "aggregate",
      accepted: true,
      amount: candidate.amount,
      currency: candidate.currency,
      category: candidate.category,
      periodLabel: candidate.periodLabel,
      note: candidate.note,
      sourceImageId: candidate.sourceImageId,
      sourceType: candidate.sourceType,
      sourcePlatform: candidate.sourcePlatform,
      dedupeKey: candidate.dedupeKey,
      overlapGroupId: candidate.overlapGroupId,
      possibleOverlap: candidate.possibleOverlap,
      source: "mock_ai",
      confidence: candidate.confidence,
      isEstimate: true,
    })) ?? [];

  return [
    ...manualTransactionRows,
    ...extractedTransactionRows,
    ...categoryHintRows,
    ...extractedAggregateRows,
  ];
}
