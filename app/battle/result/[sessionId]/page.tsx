import { BattleShell } from "@/components/battle-shell";
import { ResultStoryFlow } from "@/components/result-story-flow";
import { buildReportStoryScreens } from "@/lib/report-story";
import { routePages } from "@/lib/route-content";
import { mockPersistence } from "@/server/providers/mock-singleton";

type ResultPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { sessionId } = await params;
  const snapshot = await mockPersistence.getAnalysisSnapshot(sessionId);

  if (!snapshot?.report) {
    return (
      <BattleShell
        content={routePages.result}
        showActions={false}
        showStatusBadge={false}
        showHighlights={false}
        showSidebar={false}
      >
        <div className="max-w-2xl border border-orange-300/35 bg-orange-300/10 p-5 text-orange-50">
          <p className="text-lg font-black text-white">还没有可展示的战报</p>
          <p className="mt-3 text-sm leading-7">
            这份报告可能还没有生成，或本地 mock 进程已经重启。请回到生成页重试，或者重新完成一次战报生成。
          </p>
        </div>
      </BattleShell>
    );
  }

  const screens = buildReportStoryScreens(snapshot.report);

  return (
    <BattleShell
      content={routePages.result}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <ResultStoryFlow
        screens={screens}
        reportId={snapshot.report.id}
        analysisSessionId={snapshot.analysisSession.id}
      />
    </BattleShell>
  );
}
