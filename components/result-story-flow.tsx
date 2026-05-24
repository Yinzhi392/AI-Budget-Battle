"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Radar, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReportStoryScreen } from "@/lib/report-story";
import { cn } from "@/lib/utils";

type ResultStoryFlowProps = {
  screens: ReportStoryScreen[];
  reportId: string;
  analysisSessionId: string;
};

const accentClasses = {
  green: {
    border: "border-emerald-300/45",
    glow: "shadow-[0_0_60px_rgba(52,211,153,0.2)]",
    text: "text-emerald-200",
    bg: "bg-emerald-300",
  },
  blue: {
    border: "border-sky-300/45",
    glow: "shadow-[0_0_60px_rgba(56,189,248,0.18)]",
    text: "text-sky-200",
    bg: "bg-sky-300",
  },
  orange: {
    border: "border-orange-300/45",
    glow: "shadow-[0_0_60px_rgba(251,146,60,0.18)]",
    text: "text-orange-200",
    bg: "bg-orange-300",
  },
};

export function ResultStoryFlow({ screens, reportId, analysisSessionId }: ResultStoryFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScreen = screens[currentIndex];
  const progress = useMemo(
    () => `${Math.round(((currentIndex + 1) / screens.length) * 100)}%`,
    [currentIndex, screens.length],
  );

  if (!currentScreen) {
    return null;
  }

  return (
    <section className="grid gap-5" aria-label="Cyber Wrapped 故事流">
      <div className="flex items-center gap-2" aria-label="故事进度">
        {screens.map((screen, index) => (
          <button
            key={screen.kind}
            type="button"
            aria-label={`跳转到第 ${index + 1} 屏`}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 flex-1 border border-white/10 bg-white/10 transition",
              index <= currentIndex ? accentClasses[currentScreen.accent].bg : "",
            )}
          />
        ))}
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
        进度 {progress}
      </div>

      <StoryScreenCard
        key={currentScreen.kind}
        screen={currentScreen}
        currentIndex={currentIndex}
        total={screens.length}
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          disabled={currentIndex === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          上一屏
        </button>
        {currentIndex === screens.length - 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/dashboard?sessionId=${analysisSessionId}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-sky-300/35 bg-sky-300/10 px-5 py-3 text-sm font-bold text-sky-50 transition hover:bg-sky-300/15"
            >
              <Radar className="size-4" aria-hidden="true" />
              查看轻量面板
            </Link>
            <Link
              href={`/battle/share/${reportId}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
            >
              <Share2 className="size-4" aria-hidden="true" />
              编辑分享卡
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((value) => Math.min(screens.length - 1, value + 1))}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
          >
            下一屏
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}

export function StoryScreenCard({
  screen,
  currentIndex,
  total,
}: {
  screen: ReportStoryScreen;
  currentIndex: number;
  total: number;
}) {
  const accent = accentClasses[screen.accent];

  return (
    <article
      className={cn(
        "min-h-[430px] animate-[pulse_420ms_ease-out_1] overflow-hidden border bg-zinc-950/75 p-5 backdrop-blur sm:min-h-[520px] sm:p-7",
        accent.border,
        accent.glow,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("text-xs font-black uppercase tracking-[0.2em]", accent.text)}>
            {screen.eyebrow}
          </p>
          <p className="mt-2 text-sm font-bold text-zinc-500">
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
        {screen.tag ? (
          <span className="max-w-[52%] border border-white/10 bg-white/[0.04] px-3 py-2 text-right text-xs font-black text-white">
            {screen.tag}
          </span>
        ) : null}
      </div>

      {screen.quote ? (
        screen.kind === "personality" ? (
          screen.personaImage ? <PersonaCharacter image={screen.personaImage} /> : null
        ) : (
          <div
            className={cn(
              "mt-8 inline-grid min-h-20 min-w-20 place-items-center border px-5 text-3xl font-black",
              accent.border,
              accent.text,
            )}
          >
            {screen.quote}
          </div>
        )
      ) : null}

      <h2 className="mt-8 text-4xl font-black leading-tight text-white sm:text-6xl">
        {screen.title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
        {screen.body}
      </p>

      {screen.scores ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr] lg:items-center">
          {screen.radarPoints ? <ScoreRadar points={screen.radarPoints} /> : null}
          <div className="grid gap-3">
            {screen.scores.map((score) => (
              <div key={score.label} className="grid gap-2">
                <div className="flex items-center justify-between gap-4 text-sm font-bold">
                  <span className="text-zinc-300">{score.label}</span>
                  <span className={accent.text}>{score.value}</span>
                </div>
                <div className="h-3 border border-white/10 bg-white/5">
                  <div
                    className={cn("h-full animate-[bar-grow_900ms_ease-out_1]", accent.bg)}
                    style={{ width: `${Math.min(100, Math.max(0, score.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {screen.kind === "behavior" ? <BehaviorPulse /> : null}

      {screen.bullets?.length ? (
        <ul
          className={cn(
            "mt-8 grid gap-3",
            screen.bullets.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2",
          )}
        >
          {screen.bullets.map((item) => (
            <li
              key={item}
              className={cn(
                "border bg-white/[0.055] p-5 text-lg font-black leading-8 text-zinc-50 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:text-xl sm:leading-9",
                accent.border,
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function PersonaCharacter({
  image,
}: {
  image: NonNullable<ReportStoryScreen["personaImage"]>;
}) {
  return (
    <div className="mt-8 w-full max-w-[340px]">
      <div
        className="relative aspect-square overflow-hidden border border-white/10 bg-black shadow-[0_0_40px_rgba(0,0,0,0.38)]"
        data-testid="persona-character-frame"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          unoptimized
          sizes="(min-width: 640px) 340px, 80vw"
          className="object-contain p-3"
        />
      </div>
    </div>
  );
}

function BehaviorPulse() {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {["小额高频", "情绪补给", "预算偷袭"].map((label, index) => (
        <div
          key={label}
          className="relative overflow-hidden border border-sky-300/25 bg-sky-300/10 p-4"
        >
          <div
            className="absolute inset-x-0 top-0 h-1 animate-[scan-horizontal_1.8s_ease-in-out_infinite] bg-sky-300"
            style={{ animationDelay: `${index * 180}ms` }}
          />
          <Radar className="size-5 text-sky-200" aria-hidden="true" />
          <p className="mt-4 text-lg font-black text-white">{label}</p>
        </div>
      ))}
    </div>
  );
}

function ScoreRadar({ points }: { points: Array<{ label: string; value: number; x: number; y: number }> }) {
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const maxRadius = 42;
  const labelRadius = 53;

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <svg
        viewBox="-12 -14 124 128"
        role="img"
        aria-label="五维消费能力雷达图"
        className="w-full overflow-visible"
      >
        <title>五维消费能力雷达图</title>
        {[18, 30, maxRadius].map((radius) => (
          <polygon
            key={radius}
            points={points
              .map((_, index) => {
                const angle = (-90 + index * 72) * (Math.PI / 180);
                return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.6"
          />
        ))}
        {points.map((point, index) => {
          const angle = (-90 + index * 72) * (Math.PI / 180);
          const outerX = 50 + Math.cos(angle) * maxRadius;
          const outerY = 50 + Math.sin(angle) * maxRadius;

          return (
            <line
              key={`${point.label}-axis`}
              x1="50"
              y1="50"
              x2={outerX}
              y2={outerY}
              stroke="rgba(56,189,248,0.18)"
              strokeWidth="0.5"
            />
          );
        })}
        <polygon
          points={polygon}
          fill="rgba(52,211,153,0.26)"
          stroke="rgba(52,211,153,0.9)"
          strokeWidth="1.2"
          className="animate-[radar-fill_900ms_ease-out_1]"
        />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="1.8" fill="rgb(56,189,248)" />
        ))}
        {points.map((point, index) => {
          const angle = (-90 + index * 72) * (Math.PI / 180);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const labelX = 50 + cos * labelRadius;
          const labelY = 50 + sin * labelRadius;
          const textAnchor = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
          const labelDy = sin < -0.45 ? -2.2 : sin > 0.45 ? 4.8 : 1.6;

          return (
            <text
              key={`${point.label}-label`}
              x={labelX}
              y={labelY}
              dy={labelDy}
              textAnchor={textAnchor}
              data-testid="score-radar-label"
              className="fill-zinc-100 text-[5px] font-black"
              letterSpacing="0"
              stroke="rgba(0,0,0,0.78)"
              strokeWidth="0.45"
              paintOrder="stroke"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
