import { cookies } from "next/headers";
import Link from "next/link";
import { DashboardPanel } from "@/app/dashboard/dashboard-panel";
import { BattleShell } from "@/components/battle-shell";
import { buildDashboardSummary } from "@/lib/dashboard-summary";
import { routePages } from "@/lib/route-content";
import { readAuthCookieState } from "@/server/auth/session";
import { mockPersistence } from "@/server/providers/mock-singleton";

type DashboardPageProps = {
  searchParams: Promise<{
    sessionId?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [{ sessionId }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const auth = readAuthCookieState(cookieStore);

  if (!auth.userId) {
    return (
      <BattleShell
        content={routePages.dashboard}
        showActions={false}
        showStatusBadge={false}
        showHighlights={false}
        showSidebar={false}
      >
        <section className="grid max-w-2xl gap-4 border border-orange-300/35 bg-orange-300/10 p-5 text-orange-50">
          <p className="text-lg font-black text-white">登录后查看轻量面板</p>
          <p className="text-sm leading-7">
            面板只展示确认后的分类摘要、分数解释和截图保留状态，不展示原始截图。
          </p>
          <Link
            href={`/auth?returnTo=${encodeURIComponent(sessionId ? `/dashboard?sessionId=${sessionId}` : "/dashboard")}`}
            className="inline-flex min-h-12 items-center justify-center bg-orange-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-orange-200"
          >
            登录后查看面板
          </Link>
        </section>
      </BattleShell>
    );
  }

  const savedReports = await mockPersistence.listSavedReportsForUser(auth.userId);
  const selected = sessionId
    ? await mockPersistence.getSavedReportForUser(sessionId, auth.userId)
    : savedReports[0];

  return (
    <BattleShell
      content={routePages.dashboard}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      {!selected?.report ? (
        <section className="grid max-w-2xl gap-4 border border-white/10 bg-white/[0.04] p-5 text-zinc-300">
          <p className="text-lg font-black text-white">还没有可展示的面板</p>
          <p className="text-sm leading-7">
            保存战报后，这里会显示分类拆解、分数解释、确认输入摘要和截图保留状态。
          </p>
          <Link
            href="/history"
            className="inline-flex min-h-12 items-center justify-center border border-emerald-300/35 bg-emerald-300/10 px-5 py-3 text-sm font-bold text-emerald-50 transition hover:bg-emerald-300/15"
          >
            返回历史
          </Link>
        </section>
      ) : (
        <DashboardPanel
          summary={buildDashboardSummary(selected, {
            now: new Date().toISOString(),
          })}
        />
      )}
    </BattleShell>
  );
}
