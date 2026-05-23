"use client";

import { useFormStatus } from "react-dom";
import { saveRegionCurrency } from "@/app/battle/actions";
import type { SelectOption } from "@/lib/world-options";

type RegionCurrencyFormProps = {
  worldRegions: SelectOption[];
  worldCurrencies: SelectOption[];
};

export function RegionCurrencyForm({
  worldRegions,
  worldCurrencies,
}: RegionCurrencyFormProps) {
  return (
    <form
      action={saveRegionCurrency}
      className="grid max-w-2xl gap-3 border border-white/10 bg-zinc-950/60 p-4"
    >
      <label
        data-testid="region-option-cn-mainland"
        className="flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200 transition has-[input:checked]:border-emerald-300/70 has-[input:checked]:bg-emerald-300/15 has-[input:checked]:text-emerald-100"
      >
        <input
          type="radio"
          name="region"
          value="cn_mainland"
          className="size-4 accent-emerald-300"
          defaultChecked
        />
        <span>中国大陆学生 / CNY</span>
      </label>

      <div
        data-testid="region-option-study-abroad"
        className="grid gap-4 border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200 transition has-[input:checked]:border-sky-300/70 has-[input:checked]:bg-sky-300/15 has-[input:checked]:text-sky-100"
      >
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="region"
            value="study_abroad"
            className="size-4 accent-sky-300"
          />
          <span>留学生</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <span className="text-xs font-bold uppercase text-sky-200">国家 / 地区</span>
            <select
              name="countryRegion"
              defaultValue="MY"
              className="min-h-12 w-full touch-manipulation appearance-auto border border-sky-300/25 bg-zinc-950 px-3 text-base text-zinc-100 sm:text-sm"
              aria-label="留学国家或地区"
            >
              {worldRegions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <span className="text-xs font-bold uppercase text-sky-200">货币</span>
            <select
              name="studyCurrency"
              defaultValue="MYR"
              className="min-h-12 w-full touch-manipulation appearance-auto border border-sky-300/25 bg-zinc-950 px-3 text-base text-zinc-100 sm:text-sm"
              aria-label="留学地区货币"
            >
              {worldCurrencies.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <input type="hidden" name="currency" value="CNY" />

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-65"
    >
      {pending ? "正在进入..." : "继续选择周期"}
    </button>
  );
}
