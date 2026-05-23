"use client";

import { useActionState, useMemo, useState } from "react";
import { confirmRowsAction } from "@/app/battle/confirm/actions";
import {
  getConfirmationRowBadges,
  type ConfirmationRowInput,
} from "@/server/confirm/validation";
import type { CategoryOption } from "@/server/upload/validation";
import type { Currency } from "@/types/domain";

type ConfirmationFormProps = {
  initialRows: ConfirmationRowInput[];
  currency: Currency;
  categories: CategoryOption[];
};

export function ConfirmationForm({
  initialRows,
  currency,
  categories,
}: ConfirmationFormProps) {
  const [rows, setRows] = useState<ConfirmationRowInput[]>(initialRows);
  const [clientError, setClientError] = useState<string>();
  const [actionState, formAction, isPending] = useActionState(confirmRowsAction, {});
  const acceptedCount = rows.filter((row) => row.accepted).length;
  const rowsJson = useMemo(() => JSON.stringify(rows), [rows]);

  function updateRow(index: number, patch: Partial<ConfirmationRowInput>) {
    setRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
    setClientError(undefined);
  }

  function deleteRow(index: number) {
    setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
    setClientError(undefined);
  }

  function addTransactionRow() {
    setRows((currentRows) => [
      ...currentRows,
      {
        id: `manual_tx_${Date.now()}`,
        kind: "transaction",
        accepted: true,
        amount: "",
        currency,
        category: categories[0]?.value ?? "other",
        merchant: "",
        transactionTime: new Date().toISOString().slice(0, 16),
        source: "manual",
        confidence: 1,
      },
    ]);
    setClientError(undefined);
  }

  function addAggregateRow() {
    setRows((currentRows) => [
      ...currentRows,
      {
        id: `manual_aggregate_${Date.now()}`,
        kind: "aggregate",
        accepted: true,
        amount: "",
        currency,
        category: categories[0]?.value ?? "other",
        periodLabel: "",
        note: "",
        source: "manual",
        confidence: 0.7,
        isEstimate: true,
      },
    ]);
    setClientError(undefined);
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const error = getClientValidationError(rows);
        if (error) {
          event.preventDefault();
          setClientError(error);
        }
      }}
      className="grid gap-5"
    >
      <input type="hidden" name="rows" value={rowsJson} />

      <div className="grid gap-3 border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-50 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-200/75">已接受</p>
          <p className="mt-1 text-2xl font-black text-white">{acceptedCount}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-emerald-200/75">规则</p>
          <p className="mt-1 font-bold text-white">金额 / 货币 / 分类 / 时间或周期</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-emerald-200/75">汇总</p>
          <p className="mt-1 font-bold text-white">估算项会单独进入报告输入</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={addTransactionRow}
          className="min-h-11 border border-sky-300/35 bg-sky-300/10 px-4 text-sm font-bold text-sky-100 transition hover:bg-sky-300/15"
        >
          添加交易
        </button>
        <button
          type="button"
          onClick={addAggregateRow}
          className="min-h-11 border border-orange-300/35 bg-orange-300/10 px-4 text-sm font-bold text-orange-100 transition hover:bg-orange-300/15"
        >
          添加估算汇总
        </button>
      </div>

      {rows.length === 0 || acceptedCount === 0 ? (
        <p className="border border-orange-300/25 bg-orange-300/10 p-4 text-sm font-bold text-orange-100">
          还没有已接受的数据。可以添加一笔交易或一个估算汇总继续。
        </p>
      ) : null}

      <div className="grid gap-4">
        {rows.map((row, index) => (
          <section
            key={row.id ?? `${row.kind}_${index}`}
            className="grid gap-4 border border-white/10 bg-zinc-950/65 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-white">
                  {row.kind === "transaction" ? "逐笔交易" : "估算汇总"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getConfirmationRowBadges(row).map((badge) => (
                    <span
                      key={badge}
                      className="border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-bold text-zinc-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={row.accepted}
                    onChange={(event) => updateRow(index, { accepted: event.currentTarget.checked })}
                    className="size-4 accent-emerald-300"
                  />
                  接受此行
                </label>
                <button
                  type="button"
                  onClick={() => deleteRow(index)}
                  className="min-h-10 border border-white/10 px-3 text-sm font-bold text-zinc-200 transition hover:border-orange-300/50 hover:text-orange-100"
                >
                  删除此行
                </button>
              </div>
            </div>

            {row.kind === "transaction" ? (
              <TransactionFields
                row={row}
                index={index}
                categories={categories}
                onChange={updateRow}
              />
            ) : (
              <AggregateFields
                row={row}
                index={index}
                categories={categories}
                onChange={updateRow}
              />
            )}
          </section>
        ))}
      </div>

      {clientError || actionState.error ? (
        <p className="border border-orange-300/30 bg-orange-300/10 p-3 text-sm font-bold text-orange-100">
          {clientError ?? actionState.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "保存中..." : "确认并生成战报"}
      </button>
    </form>
  );
}

function TransactionFields({
  row,
  index,
  categories,
  onChange,
}: {
  row: ConfirmationRowInput;
  index: number;
  categories: CategoryOption[];
  onChange: (index: number, patch: Partial<ConfirmationRowInput>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        交易金额
        <input
          value={String(row.amount ?? "")}
          onChange={(event) => onChange(index, { amount: event.currentTarget.value })}
          inputMode="decimal"
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        货币
        <input
          value={String(row.currency ?? "")}
          onChange={(event) => onChange(index, { currency: event.currentTarget.value.toUpperCase() })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        交易分类
        <select
          value={String(row.category ?? "")}
          onChange={(event) => onChange(index, { category: event.currentTarget.value })}
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
          type="datetime-local"
          value={toDateTimeLocalValue(row.transactionTime)}
          onChange={(event) => onChange(index, { transactionTime: event.currentTarget.value })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
        商户或备注
        <input
          value={String(row.merchant ?? row.note ?? "")}
          onChange={(event) => onChange(index, { merchant: event.currentTarget.value })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
    </div>
  );
}

function AggregateFields({
  row,
  index,
  categories,
  onChange,
}: {
  row: ConfirmationRowInput;
  index: number;
  categories: CategoryOption[];
  onChange: (index: number, patch: Partial<ConfirmationRowInput>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        汇总金额
        <input
          value={String(row.amount ?? "")}
          onChange={(event) => onChange(index, { amount: event.currentTarget.value })}
          inputMode="decimal"
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        货币
        <input
          value={String(row.currency ?? "")}
          onChange={(event) => onChange(index, { currency: event.currentTarget.value.toUpperCase() })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        汇总分类
        <select
          value={String(row.category ?? "")}
          onChange={(event) => onChange(index, { category: event.currentTarget.value })}
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
        估算周期
        <input
          value={String(row.periodLabel ?? "")}
          onChange={(event) => onChange(index, { periodLabel: event.currentTarget.value })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
        说明
        <input
          value={String(row.note ?? "")}
          onChange={(event) => onChange(index, { note: event.currentTarget.value })}
          className="min-h-12 border border-white/10 bg-zinc-950 px-3 text-zinc-100"
        />
      </label>
    </div>
  );
}

function getClientValidationError(rows: ConfirmationRowInput[]) {
  const acceptedRows = rows.filter((row) => row.accepted);
  if (acceptedRows.length === 0) {
    return "请至少确认一条交易或估算汇总";
  }

  for (const row of acceptedRows) {
    if (!Number.isFinite(Number(row.amount)) || Number(row.amount) <= 0) {
      return "请输入大于 0 的金额";
    }
    if (!String(row.currency ?? "").trim()) {
      return "请选择有效的货币";
    }
    if (!String(row.category ?? "").trim()) {
      return "请选择有效的消费分类";
    }
    if (row.kind === "transaction" && !String(row.transactionTime ?? "").trim()) {
      return "请选择消费时间";
    }
    if (row.kind === "aggregate" && !String(row.periodLabel ?? "").trim()) {
      return "请输入估算周期";
    }
  }

  return undefined;
}

function toDateTimeLocalValue(value: ConfirmationRowInput["transactionTime"]) {
  if (!value) {
    return "";
  }

  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}
