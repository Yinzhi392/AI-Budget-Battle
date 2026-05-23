import { cookies } from "next/headers";
import { BattleShell } from "@/components/battle-shell";
import { ShareCardStudio } from "@/components/share-card-studio";
import { buildShareCardViewModels, formatSharePeriod } from "@/lib/share-card";
import { routePages } from "@/lib/route-content";
import { readAuthCookieState } from "@/server/auth/session";
import { mockPersistence } from "@/server/providers/mock-singleton";

type SharePageProps = {
  params: Promise<{
    reportId: string;
  }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { reportId } = await params;
  const [snapshot, cookieStore] = await Promise.all([
    mockPersistence.getAnalysisSnapshotByReportId(reportId),
    cookies(),
  ]);
  const auth = readAuthCookieState(cookieStore);

  if (!snapshot?.report) {
    return (
      <BattleShell
        content={routePages.share}
        showActions={false}
        showStatusBadge={false}
        showHighlights={false}
        showSidebar={false}
      >
        <div className="max-w-2xl border border-orange-300/35 bg-orange-300/10 p-5 text-orange-50">
          <p className="text-lg font-black text-white">还没有可分享的战报</p>
          <p className="mt-3 text-sm leading-7">
            分享卡需要先完成战报生成。请回到结果页或重新生成战报后再编辑分享卡。
          </p>
        </div>
      </BattleShell>
    );
  }

  const cards = buildShareCardViewModels(snapshot.report, {
    periodLabel: formatSharePeriod(
      snapshot.analysisSession.periodStart,
      snapshot.analysisSession.periodEnd,
    ),
    isWatermarked: true,
  });

  return (
    <BattleShell
      content={routePages.share}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <ShareCardStudio reportId={reportId} cards={cards} authEmail={auth.email} />
    </BattleShell>
  );
}
