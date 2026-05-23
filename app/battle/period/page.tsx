import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { savePeriod } from "@/app/battle/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";

export default async function PeriodPage() {
  const cookieStore = await cookies();
  const redirectTarget = getSetupRedirectTarget({
    ...readSetupCookieState(cookieStore),
    periodType: "this_month",
    periodStart: "pending",
    periodEnd: "pending",
    analysisSessionId: "pending",
  });

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return (
    <BattleShell
      content={routePages.period}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <form action={savePeriod} className="grid max-w-2xl gap-3 border border-white/10 bg-zinc-950/60 p-4">
        <label className="flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200 transition has-[:checked]:border-sky-300/70 has-[:checked]:bg-sky-300/15 has-[:checked]:text-sky-100">
          <input
            type="radio"
            name="periodType"
            value="this_week"
            className="size-4 accent-sky-300"
          />
          <span>本周</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200 transition has-[:checked]:border-emerald-300/70 has-[:checked]:bg-emerald-300/15 has-[:checked]:text-emerald-100">
          <input
            type="radio"
            name="periodType"
            value="this_month"
            className="size-4 accent-emerald-300"
            defaultChecked
          />
          <span>本月</span>
        </label>
        <div className="grid gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200 transition has-[:checked]:border-orange-300/70 has-[:checked]:bg-orange-300/15 has-[:checked]:text-orange-100 sm:grid-cols-[auto_1fr_1fr] sm:items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="periodType"
              value="custom"
              className="size-4 accent-orange-300"
            />
            <span>自定义周期</span>
          </label>
          <input
            type="date"
            name="customStart"
            className="min-h-11 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            defaultValue="2026-05-01"
            aria-label="自定义开始日期"
          />
          <input
            type="date"
            name="customEnd"
            className="min-h-11 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            defaultValue="2026-05-21"
            aria-label="自定义结束日期"
          />
        </div>
        <button
          type="submit"
          className="mt-2 inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
        >
          进入上传
        </button>
      </form>
    </BattleShell>
  );
}
