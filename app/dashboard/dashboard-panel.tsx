"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "@/lib/dashboard-summary";

type DashboardPanelProps = {
  summary: DashboardSummary;
};

export function DashboardPanel({ summary }: DashboardPanelProps) {
  return (
    <section className="grid max-w-6xl gap-5">
      <div className="border border-emerald-300/30 bg-emerald-300/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
          Details after story
        </p>
        <h2 className="mt-3 text-3xl font-black text-white">{summary.personalityTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-50/85">
          {summary.periodLabel} · 总计 {summary.currency} {summary.totalAmount.toFixed(2)}
          ，其中估算 {summary.currency} {summary.estimatedTotal.toFixed(2)}。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border border-sky-300/25 bg-sky-300/10 p-5">
          <p className="text-lg font-black text-white">分类拆解</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.categoryBreakdown}>
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(226,232,240,0.8)" tickLine={false} />
                <YAxis stroke="rgba(226,232,240,0.8)" tickLine={false} width={42} />
                <Tooltip
                  cursor={{ fill: "rgba(56,189,248,0.08)" }}
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid rgba(56,189,248,0.35)",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="amount" fill="#34d399" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-bold text-zinc-400">确认输入</p>
            <p className="mt-3 text-2xl font-black text-white">{summary.transactionSummary}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              精确金额 {summary.currency} {summary.exactTotal.toFixed(2)} / 估算金额 {summary.currency} {summary.estimatedTotal.toFixed(2)}
            </p>
          </div>

          <div className="border border-orange-300/25 bg-orange-300/10 p-5">
            <p className="text-sm font-bold text-orange-100">截图保留</p>
            <p className="mt-3 text-sm leading-7 text-orange-50/85">
              原始截图只作为临时分析资产，最长 24 小时，不作为历史战报内容保留。
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-white/10 bg-zinc-950/70 p-5">
          <p className="text-lg font-black text-white">五维解释</p>
          <div className="mt-4 grid gap-3">
            {summary.scoreExplanations.map((score) => (
              <div key={score.label} className="border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-4 text-sm font-bold">
                  <span className="text-zinc-300">{score.label}</span>
                  <span className="text-emerald-200">{score.value}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{score.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-white/10 bg-zinc-950/70 p-5">
          <p className="text-lg font-black text-white">风险便签</p>
          <ul className="mt-4 grid gap-3">
            {summary.riskNotes.map((note) => (
              <li key={note} className="border border-orange-300/25 bg-orange-300/10 p-3 text-sm leading-6 text-orange-50">
                {note}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="border border-white/10 bg-white/[0.035] p-5">
        <p className="text-lg font-black text-white">截图保留状态</p>
        <div className="mt-4 grid gap-3">
          {summary.retentionItems.length === 0 ? (
            <p className="text-sm text-zinc-400">没有历史截图资产。</p>
          ) : (
            summary.retentionItems.map((item) => (
              <div
                key={item.imageId}
                className="grid gap-2 border border-white/10 bg-zinc-950/70 p-3 text-sm text-zinc-300 sm:grid-cols-[1fr_auto]"
              >
                <span>{item.originalName}</span>
                <span className="font-bold text-sky-200">
                  {item.status === "expired"
                    ? "已过期"
                    : item.status === "deletable_after_analysis"
                      ? "分析后可删除"
                      : "临时保留"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
