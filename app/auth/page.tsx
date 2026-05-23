import { cookies } from "next/headers";
import Link from "next/link";
import { AuthForm } from "@/app/auth/auth-form";
import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { readAuthCookieState, sanitizeReturnTo } from "@/server/auth/session";

type AuthPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [{ returnTo }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const auth = readAuthCookieState(cookieStore);
  const safeReturnTo = sanitizeReturnTo(returnTo);

  return (
    <BattleShell
      content={routePages.auth}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      {auth.userId ? (
        <section className="grid max-w-2xl gap-4 border border-emerald-300/35 bg-emerald-300/10 p-5 text-emerald-50">
          <p className="text-lg font-black text-white">已登录 {auth.email}</p>
          <p className="text-sm leading-7">
            当前匿名战报已经关联到 mock 账号。你可以返回刚才的页面继续保存历史、去水印或重复导出。
          </p>
          <Link
            href={safeReturnTo}
            className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
          >
            回到刚才页面
          </Link>
        </section>
      ) : (
        <AuthForm returnTo={safeReturnTo} />
      )}
    </BattleShell>
  );
}
