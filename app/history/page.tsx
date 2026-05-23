import { cookies } from "next/headers";
import Link from "next/link";
import { deleteSavedReportAction } from "@/app/history/actions";
import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { readAuthCookieState } from "@/server/auth/session";
import { mockPersistence } from "@/server/providers/mock-singleton";

type HistoryPageProps = {
  searchParams: Promise<{
    deleted?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const [{ deleted }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const auth = readAuthCookieState(cookieStore);

  if (!auth.userId) {
    return (
      <BattleShell
        content={routePages.history}
        showActions={false}
        showStatusBadge={false}
        showHighlights={false}
        showSidebar={false}
      >
        <section className="grid max-w-2xl gap-4 border border-orange-300/35 bg-orange-300/10 p-5 text-orange-50">
          <p className="text-lg font-black text-white">登录后查看历史战报</p>
          <p className="text-sm leading-7">
            历史页只展示已登录账号保存过的战报，不展示原始截图，也不会变成密集账本。
          </p>
          <Link
            href="/auth?returnTo=/history"
            className="inline-flex min-h-12 items-center justify-center bg-orange-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-orange-200"
          >
            登录后查看历史
          </Link>
        </section>
      </BattleShell>
    );
  }

  const reports = await mockPersistence.listSavedReportsForUser(auth.userId);

  return (
    <BattleShell
      content={routePages.history}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <section className="grid max-w-5xl gap-5">
        <div className="border border-emerald-300/30 bg-emerald-300/10 p-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Saved Reports
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">已保存战报</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-50/85">
            已登录 {auth.email}。这里保存的是战报和结构化摘要，不保存原始截图。
          </p>
        </div>

        {deleted ? (
          <p className="border border-sky-300/30 bg-sky-300/10 p-3 text-sm font-bold text-sky-100">
            已删除战报。
          </p>
        ) : null}

        {reports.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.04] p-5 text-zinc-300">
            还没有保存的战报。生成战报后登录并保存，就会出现在这里。
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((snapshot) => {
              const report = snapshot.report;
              if (!report) {
                return null;
              }

              return (
                <article
                  key={report.id}
                  className="grid gap-4 border border-white/10 bg-zinc-950/70 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                      {snapshot.analysisSession.periodStart.slice(0, 10)} - {snapshot.analysisSession.periodEnd.slice(0, 10)}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-white">{report.personality.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
                      {report.personality.description}
                    </p>
                    <p className="mt-3 text-sm font-bold text-orange-100">{report.challenge.tag}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-72 lg:grid-cols-1">
                    <Link
                      href={`/battle/result/${snapshot.analysisSession.id}`}
                      className="inline-flex min-h-11 items-center justify-center bg-emerald-300 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
                    >
                      打开战报
                    </Link>
                    <Link
                      href={`/dashboard?sessionId=${snapshot.analysisSession.id}`}
                      className="inline-flex min-h-11 items-center justify-center border border-sky-300/35 bg-sky-300/10 px-4 py-2 text-sm font-bold text-sky-50 transition hover:bg-sky-300/15"
                    >
                      查看轻量面板
                    </Link>
                    <Link
                      href={`/battle/share/${report.id}`}
                      className="inline-flex min-h-11 items-center justify-center border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                    >
                      分享
                    </Link>
                    <form action={deleteSavedReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 w-full items-center justify-center border border-orange-300/35 bg-orange-300/10 px-4 py-2 text-sm font-bold text-orange-100 transition hover:bg-orange-300/15"
                      >
                        删除战报
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </BattleShell>
  );
}
