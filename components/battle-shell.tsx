import Link from "next/link";
import { ArrowRight, ChevronRight, LockKeyhole, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { battleFlow, type RoutePageContent } from "@/lib/route-content";
import { cn } from "@/lib/utils";

type BattleShellProps = {
  content: RoutePageContent;
  children?: ReactNode;
  showActions?: boolean;
  showStatusBadge?: boolean;
  showHighlights?: boolean;
  showSidebar?: boolean;
};

export function BattleShell({
  content,
  children,
  showActions = true,
  showStatusBadge = true,
  showHighlights = true,
  showSidebar = true,
}: BattleShellProps) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <div className="cyber-grid pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="site-atmosphere pointer-events-none fixed inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col px-4 sm:px-7 lg:px-10">
        <header className="flex min-h-[72px] items-center justify-between gap-5 border-b border-white/10 py-3">
          <Link href="/" className="group inline-flex shrink-0 items-center gap-3" aria-label="返回 AI Budget Battle 首页">
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#c8ff54] text-[#10120d] transition-transform duration-300 group-hover:-rotate-3 group-active:scale-[0.96]">
              <Sparkles className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="hidden text-sm font-bold tracking-[-0.02em] text-white sm:block">
              AI Budget Battle
            </span>
          </Link>

          <nav
            aria-label="战斗流程"
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.035] p-1 [-webkit-overflow-scrolling:touch]"
          >
            {battleFlow.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-[#979d94] transition hover:bg-white/[0.07] hover:text-white sm:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <div
          className={cn(
            "grid min-w-0 flex-1 items-start gap-8 py-12 sm:py-16 lg:py-20",
            showSidebar
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.4fr)] lg:gap-16"
              : "lg:grid-cols-1",
          )}
        >
          <section className="min-w-0 max-w-5xl">
            {showStatusBadge ? (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8ff54]/20 bg-[#c8ff54]/10 px-3 py-2 text-xs font-semibold text-[#ddff99]">
                <Sparkles className="size-4" strokeWidth={1.8} aria-hidden="true" />
                {content.statusLabel}
              </div>
            ) : null}

            <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8ff54]">
              {content.eyebrow}
            </p>
            <h1 className="max-w-4xl break-words text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#aeb4aa] sm:text-lg sm:leading-8">
              {content.description}
            </p>

            {showActions ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {content.primaryAction ? (
                  <Link
                    href={content.primaryAction.href}
                    className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#c8ff54] px-6 text-sm font-extrabold text-[#10120d] transition hover:bg-[#d8ff82] active:scale-[0.98]"
                  >
                    {content.primaryAction.label}
                    <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                ) : null}
                {content.secondaryAction ? (
                  <Link
                    href={content.secondaryAction.href}
                    className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    {content.secondaryAction.label}
                    <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : null}

            {children ? (
              <div className="battle-content mt-9 min-w-0" data-battle-content>
                {children}
              </div>
            ) : null}

            {showHighlights ? (
              <div
                className={cn(
                  "mt-10 grid border-t border-white/10 pt-5 text-sm text-[#aeb4aa]",
                  content.highlights.length === 1 ? "gap-2" : "gap-4 sm:grid-cols-3",
                )}
              >
                {content.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3">
                    <LockKeyhole className="size-4 shrink-0 text-[#c8ff54]" strokeWidth={1.8} aria-hidden="true" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {showSidebar ? (
            <aside className="grid gap-4 lg:sticky lg:top-8">
              <div className="rounded-[24px] border border-white/10 bg-[#11130f]/88 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                <p className="text-sm font-semibold text-[#939990]">本页概览</p>
                <div className="mt-4">
                  {content.panels.map((panel) => (
                    <div key={panel.label} className="border-b border-white/10 py-5 first:pt-0 last:border-b-0 last:pb-0">
                      <p className="text-xs font-medium text-[#787e75]">{panel.label}</p>
                      <p className="mt-2 text-lg font-bold leading-snug tracking-[-0.02em] text-white">
                        {panel.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-[#c8ff54]/16 bg-[#c8ff54]/[0.07] p-5 text-sm leading-7 text-[#d7deb0]">
                当前演示默认使用 Mock 数据，不需要上传真实敏感账单也能体验完整流程。
              </div>
            </aside>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-7 text-xs text-[#72786f]">
          <span>AI Budget Battle</span>
          <span>Developer: Yinzhi</span>
        </footer>
      </div>
    </main>
  );
}
