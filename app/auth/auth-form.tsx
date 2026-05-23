"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/app/auth/actions";

type AuthFormProps = {
  returnTo: string;
};

export function AuthForm({ returnTo }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />

      <section className="border border-emerald-300/30 bg-emerald-300/10 p-5">
        <p className="text-lg font-black text-white">登录后继续</p>
        <p className="mt-3 text-sm leading-7 text-emerald-50/85">
          匿名体验不会被打断。登录后会把当前匿名战报关联到你的 mock 账号，用于保存历史、去水印、重复导出和再次生成战报。
        </p>
      </section>

      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        邮箱
        <input
          name="email"
          type="email"
          placeholder="student@qq.com"
          className="min-h-12 border border-white/15 bg-zinc-950/80 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/70"
          aria-label="邮箱"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          name="method"
          value="email_magic_link"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="size-4" aria-hidden="true" />
          {isPending ? "登录中..." : "发送 Magic Link 并登录"}
        </button>

        <button
          type="submit"
          name="method"
          value="google_oauth"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-sky-300/35 bg-sky-300/10 px-5 py-3 text-sm font-bold text-sky-50 transition hover:border-sky-200/70 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          使用 Google OAuth
        </button>
      </div>

      <div className="border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-zinc-300">
        支持 QQ Mail、163、Outlook、Gmail 和学校邮箱。验证码登录不在 MVP 范围内。
      </div>

      {state.error ? (
        <p className="border border-orange-300/35 bg-orange-300/10 p-3 text-sm font-bold text-orange-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
