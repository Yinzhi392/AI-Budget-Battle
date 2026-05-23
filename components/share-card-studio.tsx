"use client";

import { toPng } from "html-to-image";
import { Download, Lock, QrCode } from "lucide-react";
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
  return (
  <div
    ref={ref}
    className="relative grid w-full max-w-[420px] overflow-hidden border border-emerald-300/40 bg-zinc-950 p-5 text-white shadow-[0_0_70px_rgba(52,211,153,0.16)]"
    style={{ aspectRatio: card.aspectRatio }}
  >
    <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.11)_1px,transparent_1px)] bg-[size:32px_32px]" />
    <div className="relative z-10 grid content-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
          Cyber Wrapped
        </p>
        <h2 className="mt-4 text-4xl font-black leading-tight">{card.personalityTitle}</h2>
        <p className="mt-3 border-l-2 border-orange-300 pl-3 text-sm leading-6 text-orange-100">
          {card.roastLine}
        </p>
      </div>

      <div className="grid gap-3">
        <div className="border border-sky-300/35 bg-sky-300/10 p-3">
          <p className="text-xs font-bold text-sky-200">本期高光</p>
          <p className="mt-2 text-lg font-black leading-snug">{card.highlight}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100">
            {card.periodLabel}
          </span>
          <span className="border border-orange-300/40 bg-orange-300/10 px-3 py-2 text-xs font-black text-orange-100">
            {card.challengeTag}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-end gap-4">
        <div>
          <p className="text-sm leading-6 text-zinc-200">{card.shareCopy}</p>
          <p className="mt-3 text-xs font-bold text-zinc-500">{card.watermark}</p>
        </div>
        <div className="grid size-16 place-items-center border border-white/15 bg-white/[0.04] text-zinc-300">
          <QrCode className="size-9" aria-hidden="true" />
          <span className="sr-only">{card.inviteText}</span>
        </div>
      </div>
    </div>
  </div>
  );
});
