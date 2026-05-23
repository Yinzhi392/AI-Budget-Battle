import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSetupRedirectTarget, readSetupCookieState } from "@/server/setup/session";
import { getWorldRegionOptions } from "@/lib/world-options";
import { UploadForm } from "@/app/battle/upload/upload-form";
import { getCategoryOptionsForRegion } from "@/server/upload/validation";
import type { PeriodType } from "@/server/setup/validation";

const regionLabels = {
  cn_mainland: "中国大陆学生",
  study_abroad: "留学生",
};

const periodLabels: Record<PeriodType, string> = {
  this_week: "本周",
  this_month: "本月",
  custom: "自定义周期",
};

type UploadPageProps = {
  searchParams?: Promise<{
    extraction?: string;
  }>;
};

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const setup = readSetupCookieState(cookieStore);
  const redirectTarget = getSetupRedirectTarget(setup);
  const countryRegionLabel = setup.countryRegion
    ? getWorldRegionOptions("zh-CN").find((option) => option.code === setup.countryRegion)?.label
    : undefined;

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  if (!setup.region || !setup.currency || !setup.periodType) {
    redirect("/battle/region-currency");
  }

  const categories = getCategoryOptionsForRegion(setup.region);
  const periodLabel = getPeriodLabel(setup.periodType, setup.periodStart, setup.periodEnd);

  return (
    <BattleShell
      content={routePages.upload}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <div className="grid max-w-2xl gap-3 border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-200 sm:grid-cols-2">
        <div className="border border-emerald-300/30 bg-emerald-300/10 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-200">战区和货币</p>
          <p className="mt-2 text-lg font-black text-white">
            {setup.region ? regionLabels[setup.region] : "未选择"} / {setup.currency}
          </p>
          {setup.countryRegion ? (
            <p className="mt-1 text-xs font-semibold uppercase text-emerald-100/70">
              {countryRegionLabel ?? setup.countryRegion}
            </p>
          ) : null}
        </div>
        <div className="border border-sky-300/30 bg-sky-300/10 p-4">
          <p className="text-xs font-semibold uppercase text-sky-200">分析周期</p>
          <p className="mt-2 text-lg font-black text-white">{periodLabel}</p>
        </div>
      </div>
      <div className="mt-5">
        {params?.extraction === "failed" ? (
          <div className="mb-5 border border-orange-300/35 bg-orange-300/10 p-4 text-sm font-bold text-orange-100">
            AI 识别暂不可用。你可以添加手动交易或分类总额继续生成估算战报。
          </div>
        ) : null}
        <UploadForm currency={setup.currency} periodLabel={periodLabel} categories={categories} />
      </div>
    </BattleShell>
  );
}

function getPeriodLabel(periodType: PeriodType, periodStart?: string, periodEnd?: string) {
  if (periodType !== "custom") {
    return periodLabels[periodType];
  }

  if (!periodStart || !periodEnd) {
    return periodLabels.custom;
  }

  return `${formatDate(periodStart)} 至 ${formatDate(periodEnd)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}
