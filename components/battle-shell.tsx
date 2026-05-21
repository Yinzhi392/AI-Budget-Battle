import Link from "next/link";
import { ArrowRight, CircleDot, ShieldCheck, Sparkles } from "lucide-react";
import { battleFlow, type RoutePageContent } from "@/lib/route-content";
import { cn } from "@/lib/utils";

const accentClasses = {
  green: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.12)]",
  blue: "border-sky-300/35 bg-sky-300/10 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.12)]",
  orange:
    "border-orange-300/35 bg-orange-300/10 text-orange-100 shadow-[0_0_24px_rgba(251,146,60,0.12)]",
};

type BattleShellProps = {
  content: RoutePageContent;
};

export function BattleShell({ content }: BattleShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="cyber-grid pointer-events-none absolute inset-0" />
      <div className="scanline pointer-events-none absolute inset-0" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 shadow-[0_0_26px_rgba(52,211,153,0.2)]">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase text-white">
                AI Budget Battle
              </span>
              <span className="block text-xs text-zinc-400">
                Cyber spending report
              </span>
            </span>
          </Link>

          <nav aria-label="Battle flow" className="flex gap-2 overflow-x-auto pb-1">
            {battleFlow.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-sky-300/45 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.75fr)] lg:py-14">
          <section className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-orange-300/30 bg-orange-300/10 px-3 py-2 text-xs font-semibold uppercase text-orange-100">
              <CircleDot className="size-4" aria-hidden="true" />
              {content.statusLabel}
            </div>

            <p className="mb-4 text-sm font-semibold uppercase text-emerald-300">
              {content.eyebrow}
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {content.primaryAction ? (
                <Link
                  href={content.primaryAction.href}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
                >
                  {content.primaryAction.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
              {content.secondaryAction ? (
                <Link
                  href={content.secondaryAction.href}
                  className="inline-flex min-h-12 items-center justify-center border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                >
                  {content.secondaryAction.label}
                </Link>
              ) : null}
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
              {content.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex min-h-14 items-center gap-3 border border-white/10 bg-zinc-950/50 px-4 py-3"
                >
                  <ShieldCheck className="size-4 shrink-0 text-sky-300" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="grid gap-4">
            <div className="border border-white/10 bg-zinc-950/72 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Flow status
              </p>
              <p className="mt-2 text-2xl font-black text-white">MVP Route Map</p>
              <div className="mt-5 grid gap-3">
                {content.panels.map((panel) => (
                  <div
                    key={panel.label}
                    className={cn(
                      "min-h-24 border p-4",
                      accentClasses[panel.accent],
                    )}
                  >
                    <p className="text-xs font-semibold uppercase opacity-70">
                      {panel.label}
                    </p>
                    <p className="mt-2 text-xl font-black leading-tight">
                      {panel.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-100">
              当前页面只承载 Task 3 的骨架和视觉基调，业务状态、表单、AI 和持久化会在后续任务接入。
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
