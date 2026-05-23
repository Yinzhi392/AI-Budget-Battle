"use client";

import Link from "next/link";
import { useActionState } from "react";
import { generateReportAction } from "@/app/battle/generating/actions";

export function GenerateReportForm() {
  const [state, formAction, isPending] = useActionState(generateReportAction, {});
  const statusTitle = isPending ? "战报生成中" : "战报已准备好";
  const statusCopy = isPending
    ? "正在生成你的消费人格、吐槽和分享内容。完成后会自动打开战报页，请不要关闭页面。"
    : "点击下方按钮开始生成。完成后会自动打开战报页，不需要在这里等待手动刷新。";

  return (
    <form action={formAction} className="grid max-w-4xl gap-5">
      <section
        aria-label="生成战报扫描进度"
        className="relative grid min-h-[430px] overflow-hidden border border-emerald-300/30 bg-zinc-950/75 p-5 text-sm leading-7 text-emerald-50 shadow-[0_0_70px_rgba(52,211,153,0.14)] sm:min-h-[520px]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute left-0 top-0 h-full w-full animate-[scan_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-emerald-300/20 to-transparent" />
        <div
          aria-live="polite"
          className="relative z-10 grid gap-5 self-center"
          data-testid="scan-copy"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              Cyber Scan
            </p>
            <p className="mt-3 text-3xl font-black leading-tight text-white">
              {statusTitle}
            </p>
            <p className="mt-3 text-emerald-50/85">{statusCopy}</p>
            <div
              className="relative mt-6 h-16 overflow-hidden border border-emerald-300/30 bg-zinc-950/70"
              data-testid="loop-scan-animation"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(52,211,153,0.12)_1px,transparent_1px)] bg-[size:28px_100%]" />
              <div className="absolute inset-y-0 left-0 w-1/3 animate-[scan-horizontal_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent shadow-[0_0_30px_rgba(52,211,153,0.6)]" />
              <div className="absolute inset-x-4 top-1/2 h-px bg-emerald-200/25" />
            </div>
            <p className="mt-4 border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-50">
              {isPending ? "生成完成后会自动跳转" : "下一步：打开你的战报页"}
            </p>
          </div>
        </div>
      </section>

      {state.error ? (
        <div className="grid gap-3">
          <p className="border border-orange-300/30 bg-orange-300/10 p-3 text-sm font-bold text-orange-100">
            {state.error} {state.loginRequired ? "" : "可以检查确认页数据后重试。"}
          </p>
          {state.loginRequired ? (
            <Link
              href="/auth?returnTo=/battle/generating"
              className="inline-flex min-h-12 items-center justify-center border border-orange-300/40 bg-orange-300/10 px-5 py-3 text-sm font-bold text-orange-50 transition hover:bg-orange-300/15"
            >
              登录后继续
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "战报生成中，完成后自动打开" : "开始生成战报"}
      </button>
    </form>
  );
}
