"use client";

import { useMemo, useState } from "react";
import { saveUploadInputs } from "@/app/battle/upload/actions";
import type { CategoryOption } from "@/server/upload/validation";
import {
  getCategoryLabel,
  validateCategoryTotalInput,
  validateManualTransactionInput,
} from "@/server/upload/validation";
import type {
  SaveCategoryTotalHintInput,
  SaveConfirmedTransactionInput,
} from "@/server/providers/types";

type UploadFormProps = {
  currency: string;
  periodLabel: string;
  categories: CategoryOption[];
};

const sourceTypes = [
  {
    value: "monthly_summary",
    label: "月度分析截图",
    description: "支付宝、微信或银行 App 的月度/周期分析图，优先推荐。",
  },
  {
    value: "representative_daily",
    label: "代表性日账单",
    description: "只传几天有代表性的明细，不需要每天都截图。",
  },
  {
    value: "category_summary",
    label: "分类汇总截图",
    description: "分类排行榜、消费结构图或平台总结都可以。",
  },
] as const;

export function UploadForm({ currency, periodLabel, categories }: UploadFormProps) {
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [manualTransactions, setManualTransactions] = useState<SaveConfirmedTransactionInput[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<SaveCategoryTotalHintInput[]>([]);
  const [manualError, setManualError] = useState<string>();
  const [categoryTotalError, setCategoryTotalError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const canContinue = screenshotCount > 0 || manualTransactions.length > 0 || categoryTotals.length > 0;
  const todayValue = useMemo(() => new Date().toISOString().slice(0, 16), []);

  function addManualTransaction(formData: FormData) {
    try {
      const transaction = validateManualTransactionInput({
        amount: String(formData.get("amount") ?? ""),
        currency,
        category: String(formData.get("category") ?? ""),
        merchant: String(formData.get("merchant") ?? ""),
        transactionTime: String(formData.get("transactionTime") ?? ""),
      });
      setManualTransactions((current) => [...current, transaction]);
      setManualError(undefined);
      setSubmitError(undefined);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : "手动交易无效");
    }
  }

  function addCategoryTotal(formData: FormData) {
    try {
      const total = validateCategoryTotalInput({
        amount: String(formData.get("categoryAmount") ?? ""),
        currency,
        category: String(formData.get("categoryTotal") ?? ""),
        periodLabel,
        note: String(formData.get("categoryNote") ?? ""),
      });
      setCategoryTotals((current) => [...current, total]);
      setCategoryTotalError(undefined);
      setSubmitError(undefined);
    } catch (error) {
      setCategoryTotalError(error instanceof Error ? error.message : "分类总额无效");
    }
  }

  return (
    <form
      action={saveUploadInputs}
      onSubmit={(event) => {
        if (!canContinue) {
          event.preventDefault();
          setSubmitError("请至少上传一张截图、添加一笔交易或添加一个分类总额");
        }
      }}
      className="grid max-w-4xl gap-5"
    >
      <input type="hidden" name="manualTransactions" value={JSON.stringify(manualTransactions)} />
      <input type="hidden" name="categoryTotals" value={JSON.stringify(categoryTotals)} />

      <section className="border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-50">
        <p className="text-base font-black text-white">快速上传</p>
        <p className="mt-2 leading-7 text-emerald-50/85">
          结果会按估算型娱乐分析生成。可以只传一张月度分析图、几张代表性日账单或分类汇总图，不需要每天都截图。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {sourceTypes.map((source, index) => (
            <label
              key={source.value}
              className="grid cursor-pointer gap-2 border border-white/10 bg-zinc-950/50 p-3 text-zinc-200 transition has-[:checked]:border-emerald-300/70 has-[:checked]:bg-emerald-300/15 has-[:checked]:text-emerald-100"
            >
              <span className="flex items-center gap-2 font-bold">
                <input
                  type="radio"
                  name="sourceType"
                  value={source.value}
                  defaultChecked={index === 0}
                  className="size-4 accent-emerald-300"
                />
                {source.label}
              </span>
              <span className="text-xs leading-5 text-zinc-400">{source.description}</span>
            </label>
          ))}
        </div>
        <label className="mt-4 grid gap-2 text-sm font-bold text-white">
          账单截图
          <input
            type="file"
            name="screenshots"
            accept="image/*"
            multiple
            onChange={(event) => setScreenshotCount(event.currentTarget.files?.length ?? 0)}
            className="min-h-12 border border-white/10 bg-zinc-950 px-3 py-2 text-zinc-200 file:mr-3 file:border-0 file:bg-emerald-300 file:px-3 file:py-2 file:font-bold file:text-zinc-950"
          />
        </label>
        <p className="mt-3 text-sm text-emerald-100">
          {screenshotCount > 0
            ? `已选择 ${screenshotCount} 张截图，稍后会进入临时识别队列。`
            : "截图只做临时处理；AI 识别失败也可以继续用手动输入或分类总额。"}
        </p>
      </section>

      <section className="grid gap-4 border border-white/10 bg-zinc-950/60 p-4">
        <div>
          <p className="text-base font-black text-white">手动添加交易</p>
          <p className="mt-2 text-sm leading-7 text-zinc-300">
            不想传完整账单时，添加几笔代表性消费也可以继续生成估算战报。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            金额
            <input
              name="amount"
              inputMode="decimal"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            分类
            <select
              name="category"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            消费时间
            <input
              name="transactionTime"
              type="datetime-local"
              defaultValue={todayValue}
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            商户或备注
            <input
              name="merchant"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={(event) => addManualTransaction(new FormData(event.currentTarget.form!))}
          className="min-h-11 border border-sky-300/35 bg-sky-300/10 px-4 text-sm font-bold text-sky-100 transition hover:bg-sky-300/15"
        >
          添加交易
        </button>
        {manualError ? <p className="text-sm font-bold text-orange-200">{manualError}</p> : null}
        {manualTransactions.length > 0 ? (
          <ul className="grid gap-2 text-sm text-zinc-200">
            {manualTransactions.map((transaction, index) => (
              <li key={`${transaction.transactionTime}-${index}`} className="border border-white/10 p-3">
                {transaction.merchant ?? getCategoryLabel(transaction.category)} / {transaction.amount}{" "}
                {transaction.currency}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-4 border border-white/10 bg-zinc-950/60 p-4">
        <div>
          <p className="text-base font-black text-white">分类总额或线索</p>
          <p className="mt-2 text-sm leading-7 text-zinc-300">
            只记得某类大概花了多少也可以添加，这会被标记为估算，不会伪装成逐笔交易。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            分类总额
            <select
              name="categoryTotal"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            分类金额
            <input
              name="categoryAmount"
              inputMode="decimal"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            说明
            <input
              name="categoryNote"
              className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={(event) => addCategoryTotal(new FormData(event.currentTarget.form!))}
          className="min-h-11 border border-orange-300/35 bg-orange-300/10 px-4 text-sm font-bold text-orange-100 transition hover:bg-orange-300/15"
        >
          添加分类总额
        </button>
        {categoryTotalError ? (
          <p className="text-sm font-bold text-orange-200">{categoryTotalError}</p>
        ) : null}
        {categoryTotals.length > 0 ? (
          <ul className="grid gap-2 text-sm text-zinc-200">
            {categoryTotals.map((total, index) => (
              <li key={`${total.category}-${index}`} className="border border-white/10 p-3">
                {getCategoryLabel(total.category)} / {total.amount} {total.currency}
                {total.note ? <span className="ml-2 text-zinc-400">{total.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {submitError ? <p className="text-sm font-bold text-orange-200">{submitError}</p> : null}
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200"
      >
        进入确认
      </button>
    </form>
  );
}
