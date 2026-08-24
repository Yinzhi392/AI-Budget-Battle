"use client";

import { toPng } from "html-to-image";
import { Download, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, useRef, useState, useTransition } from "react";
import {
  saveShareCardAction,
  saveShareUpgradeAction,
  type SaveShareCardActionState,
} from "@/app/battle/share/[reportId]/actions";
import type { ShareCardViewModel } from "@/lib/share-card";
import { cn } from "@/lib/utils";

type ShareCardStudioProps = {
  reportId: string;
  cards: ShareCardViewModel[];
  authEmail?: string;
};

export function ShareCardStudio({ reportId, cards, authEmail }: ShareCardStudioProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [state, setState] = useState<SaveShareCardActionState>({});
  const [exportedOnce, setExportedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const activeCard = cards[activeIndex] ?? cards[0];
  const loginHref = `/auth?returnTo=${encodeURIComponent(`/battle/share/${reportId}`)}`;

  async function renderActiveCardImage() {
    if (!activeCard) {
      return "mock://share-card/missing.png";
    }

    if (!cardRef.current) {
      return `mock://share-card/${activeCard.templateType}.png`;
    }

    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
    } catch {
      return `mock://share-card/${activeCard.templateType}.png`;
    }
  }

  function exportCard() {
    if (!activeCard) {
      return;
    }

    if (exportedOnce && !authEmail) {
      setState({
        ok: false,
        loginRequired: true,
        message: "登录后继续：匿名用户只能导出一张水印分享卡。",
      });
      return;
    }

    startTransition(async () => {
      const imageUrl = await renderActiveCardImage();
      const result = await saveShareCardAction({
        reportId,
        templateType: activeCard.templateType,
        platform: activeCard.platform,
        imageUrl,
        challengeTag: activeCard.challengeTag,
      });
      if (result.ok || result.loginRequired) {
        setExportedOnce(true);
      }
      setState(result.loginRequired
        ? {
            ok: true,
            message: "已生成水印分享卡",
          }
        : result);
    });
  }

  function saveOrRemoveWatermark() {
    if (!activeCard) {
      return;
    }

    startTransition(async () => {
      const imageUrl = await renderActiveCardImage();
      const result = await saveShareUpgradeAction({
        reportId,
        templateType: activeCard.templateType,
        platform: activeCard.platform,
        imageUrl,
        challengeTag: activeCard.challengeTag,
      });
      setState(result);
    });
  }

  if (!activeCard) {
    return null;
  }

  return (
    <section className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.45fr)]">
      <div className="grid gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="分享卡模板">
          {cards.map((card, index) => (
            <button
              key={card.templateType}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "shrink-0 border px-4 py-3 text-sm font-black transition",
                index === activeIndex
                  ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/35",
              )}
            >
              {card.label}
            </button>
          ))}
        </div>

        <div className="grid place-items-center border border-white/10 bg-zinc-950/60 p-4">
          <ShareCardPreview ref={cardRef} card={activeCard} />
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="border border-sky-300/25 bg-sky-300/10 p-4 text-sm leading-7 text-sky-50">
          <p className="text-base font-black text-white">匿名分享规则</p>
          <p className="mt-2">
            匿名用户可以导出一张带水印分享卡。保存历史、去水印或再次导出会进入登录流程。
          </p>
          {authEmail ? (
            <p className="mt-3 border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-sm font-black text-emerald-100">
              已登录 {authEmail}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={exportCard}
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="size-4" aria-hidden="true" />
          {isPending ? "正在生成分享卡..." : "导出水印分享卡"}
        </button>

        <button
          type="button"
          onClick={saveOrRemoveWatermark}
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
        >
          <Lock className="size-4" aria-hidden="true" />
          保存历史 / 去水印
        </button>

        {state.message ? (
          <div className="grid gap-3">
            <div
              className={cn(
                "border p-4 text-sm font-bold",
                state.ok
                  ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
                  : "border-orange-300/35 bg-orange-300/10 text-orange-100",
              )}
            >
              {state.message}
            </div>
            {state.loginRequired ? (
              <Link
                href={loginHref}
                className="inline-flex min-h-12 items-center justify-center border border-orange-300/40 bg-orange-300/10 px-5 py-3 text-sm font-bold text-orange-50 transition hover:bg-orange-300/15"
              >
                去登录继续
              </Link>
            ) : null}
          </div>
        ) : null}
      </aside>
    </section>
  );
}

const ShareCardPreview = forwardRef<HTMLDivElement, { card: ShareCardViewModel }>(function ShareCardPreview(
  { card },
  ref,
) {
  const isSquare = card.templateType === "xiaohongshu_square";
  const textClampTwo =
    "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]";

  return (
  <div
    ref={ref}
    className={cn(
      "relative grid w-full max-w-[420px] overflow-hidden border border-cyan-300/55 bg-black text-white",
      isSquare ? "p-4" : "p-5",
    )}
    style={{
      aspectRatio: card.aspectRatio,
      boxShadow:
        "0 0 22px rgba(34,211,238,0.45), 0 0 54px rgba(52,211,153,0.22), 0 0 96px rgba(14,165,233,0.16), inset 0 0 28px rgba(34,211,238,0.08)",
    }}
  >
    <div className="absolute inset-0 bg-black" />
    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-300/14 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-300/12 to-transparent" />
    <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-cyan-300/10 to-transparent" />
    <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sky-300/10 to-transparent" />
    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300" />
    <p className="absolute bottom-2 right-3 z-20 text-[9px] font-bold tracking-[0.08em] text-white/50">
      {card.watermark}
    </p>
    <div className="absolute inset-x-5 top-[58%] h-px bg-gradient-to-r from-transparent via-cyan-200/14 to-transparent" />
    <div className="absolute -right-16 -top-16 size-40 rounded-full border border-cyan-200/10" />
    <div className="absolute -bottom-20 -left-16 size-48 rounded-full border border-emerald-200/10" />
    <div
      className={cn(
        "relative z-10 grid h-full min-h-0",
        isSquare ? "grid-rows-[auto_40%_minmax(0,auto)] gap-2" : "grid-rows-[auto_44%_minmax(0,auto)] gap-4",
      )}
    >
      <div className={cn("grid", isSquare ? "gap-2" : "gap-3")}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
            Cyber Wrapped
          </p>
          <span className="border border-white/10 bg-white/[0.045] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
            Battle Report
          </span>
        </div>
        <h2 className={cn("font-black leading-tight tracking-normal", isSquare ? "text-3xl" : "text-3xl sm:text-4xl")}>
          {card.personalityTitle}
        </h2>
        <p className={cn("border-l-2 border-orange-300 pl-3 text-sm font-bold leading-6 text-orange-100", isSquare ? textClampTwo : "")}>
          {card.roastLine}
        </p>
      </div>

      <div className="grid min-h-0 place-items-center">
        {card.personaImage ? (
          <div className="relative isolate grid h-full min-h-0 w-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.09),rgba(34,211,238,0.08)_42%,transparent_74%)] p-1">
            <div className="absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
            <div className="absolute aspect-square h-[94%] bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(34,211,238,0.08)_40%,transparent_70%)] blur-2xl" />
            <div className="relative isolate aspect-square h-full max-h-full overflow-visible">
              <Image
                src={card.personaImage.src}
                alt={card.personaImage.alt}
                fill
                unoptimized
                sizes={isSquare ? "260px" : "320px"}
                className="object-contain drop-shadow-[0_22px_34px_rgba(0,0,0,0.42)]"
                style={{
                  mixBlendMode: "lighten",
                  WebkitMaskImage:
                    "radial-gradient(circle at center, #000 56%, rgba(0,0,0,0.82) 70%, transparent 88%)",
                  maskImage:
                    "radial-gradient(circle at center, #000 56%, rgba(0,0,0,0.82) 70%, transparent 88%)",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className={cn("grid min-h-0", isSquare ? "gap-2" : "gap-3")}>
        <div className="border border-sky-300/30 bg-sky-300/10 p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">
            本期高光
          </p>
          <p className={cn("mt-2 font-black leading-snug", isSquare ? `text-sm ${textClampTwo}` : "text-lg sm:text-xl")}>
            {card.highlight}
          </p>
        </div>
        <div className="grid min-h-9 grid-cols-2 items-stretch gap-3">
          <span className="flex min-w-0 items-center justify-center border border-emerald-300/40 bg-emerald-300/10 px-2 py-2 text-center text-xs font-black leading-none text-emerald-100">
            {card.periodLabel}
          </span>
          <span className="flex min-w-0 items-center justify-center border border-orange-300/40 bg-orange-300/10 px-2 py-2 text-center text-xs font-black leading-none text-orange-100">
            {card.challengeTag}
          </span>
        </div>
      </div>
    </div>
  </div>
  );
});
