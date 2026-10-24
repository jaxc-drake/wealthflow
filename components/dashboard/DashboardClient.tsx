"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type {
  FinancialStatus,
  Profile,
  Transaction,
  YearlyData,
} from "@/lib/supabase/types";
import {
  calcMonthlyStats,
  calcCategoryBreakdown,
  calcRecentMonths,
  formatCurrency,
  STATUS_CONFIG,
} from "@/utils/finance";
import StatusCard from "@/components/dashboard/StatusCard";
import BudgetBar from "@/components/dashboard/BudgetBar";
import PixelTrendChart from "@/components/charts/PixelTrendChart";
import BreakdownList from "@/components/dashboard/BreakdownList";
import QuickAddButton from "@/components/transactions/QuickAddButton";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

interface Props {
  profile: Profile | null;
  transactions: Transaction[];
}

const STATUS_PILL: Record<FinancialStatus, string> = {
  healthy: "bg-brand-lime text-y2k-ink",
  warning: "bg-brand-orange text-y2k-ink",
  over_budget: "bg-brand-red text-white",
  loss: "bg-brand-pink text-white",
};

const MOMENTUM: Record<FinancialStatus, string> = {
  healthy: "On Track",
  warning: "Watch It",
  over_budget: "Over Limit",
  loss: "Deficit",
};

function StatusIcon({ status }: { status: FinancialStatus }) {
  if (status === "healthy") return <Check size={9} strokeWidth={4} />;
  if (status === "warning") return <AlertTriangle size={8} strokeWidth={4} />;
  return <X size={9} strokeWidth={4} />;
}

function Sparkline({ data }: { data: YearlyData[] }) {
  const values = data.map((d) => d.balance);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const width = 112;
  const height = 38;

  const points = values
    .map((value, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = height - 3 - ((value - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-10 w-24 shrink-0 sm:w-28"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke="#0A0A0A"
        strokeWidth="3"
        strokeLinejoin="miter"
        strokeLinecap="square"
        shapeRendering="crispEdges"
      />
    </svg>
  );
}

export default function DashboardClient({ profile, transactions }: Props) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const viewDate = new Date(viewYear, viewMonth, 1);
  const stats = calcMonthlyStats(
    transactions,
    profile?.monthly_budget || 0,
    viewDate
  );
  const recentTrend = calcRecentMonths(transactions, viewDate, 6);
  const expenseBreakdown = calcCategoryBreakdown(
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    }),
    "expense"
  );
  const statusCfg = STATUS_CONFIG[stats.status];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

  return (
    <>
      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-3 pt-1 animate-fade-in">

        {/* Month selector */}
        <div className="flex items-center justify-between">
          <div>
            <p className="y2k-eyebrow">Ringkasan</p>
            <h1 className="mt-0.5 font-wordmark text-[20px] uppercase leading-none tracking-[-0.04em]">
              {isCurrentMonth ? "Bulan Ini" : "Arsip"}
            </h1>
          </div>

          <div className="flex items-center gap-1 rounded-full border-3 border-y2k-ink bg-white p-1 shadow-hard-sm">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-y2k-lime"
            >
              <ChevronLeft size={15} strokeWidth={2.8} />
            </button>
            <span className="min-w-[62px] text-center font-mono text-[10px] font-800 uppercase tracking-tight">
              {format(viewDate, "MMM yyyy", { locale: localeId })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              aria-label="Bulan berikutnya"
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                isCurrentMonth ? "cursor-not-allowed opacity-25" : "hover:bg-y2k-lime"
              }`}
            >
              <ChevronRight size={15} strokeWidth={2.8} />
            </button>
          </div>
        </div>

        {/* Chrome balance card */}
        <section className="chrome relative overflow-hidden rounded-[30px] border-4 border-y2k-ink p-4 pb-4 shadow-hard-lg sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-[11px] font-800 uppercase tracking-[0.26em]">
              Saldo
            </p>
            <span className="holo -rotate-3 rounded-full border-2 border-y2k-ink px-3 py-1 font-display text-[8px] font-800 uppercase tracking-[0.16em] shadow-hard-sm">
              {MOMENTUM[stats.status]}
            </span>
          </div>

          <p className="mt-1 whitespace-nowrap font-mono text-[clamp(1.9rem,10.5vw,3.15rem)] font-800 leading-none tracking-[-0.075em]">
            {formatCurrency(stats.balance, profile?.currency)}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border-2 border-y2k-ink px-2.5 py-1.5 shadow-hard-sm ${STATUS_PILL[stats.status]}`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-y2k-ink bg-y2k-ink text-y2k-lime">
                <StatusIcon status={stats.status} />
              </span>
              <span className="font-display text-[9px] font-800 uppercase tracking-[0.14em]">
                {statusCfg.label}
              </span>
            </span>

            <Sparkline data={recentTrend} />
          </div>
        </section>

        {/* Income / expense */}
        <div className="grid grid-cols-2 gap-3">
          <StatusCard
            label="Pemasukan"
            value={stats.totalIncome}
            currency={profile?.currency}
            tone="lime"
          />
          <StatusCard
            label="Pengeluaran"
            value={stats.totalExpense}
            currency={profile?.currency}
            tone="purple"
          />
        </div>

        {(profile?.monthly_budget || 0) > 0 && (
          <BudgetBar
            budget={profile?.monthly_budget || 0}
            expense={stats.totalExpense}
            percent={stats.budgetUsedPercent}
            remaining={stats.remainingBudget}
            currency={profile?.currency}
            status={stats.status}
          />
        )}

        {/* 6 month trend */}
        <section className="y2k-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-wordmark text-lg uppercase leading-none tracking-[-0.04em]">
              Tren 6 Bulan
            </h3>
          </div>
          <PixelTrendChart data={recentTrend} currency={profile?.currency} />
        </section>

        {/* Top expenses */}
        <section className="y2k-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-wordmark text-lg uppercase leading-none tracking-[-0.04em]">
              Top Pengeluaran
            </h3>
            <span className="font-mono text-[9px] font-700 uppercase text-y2k-muted">
              {expenseBreakdown.length} kategori
            </span>
          </div>
          <BreakdownList
            items={expenseBreakdown}
            currency={profile?.currency}
            type="expense"
          />
        </section>

        {/* Recent transactions */}
        <section className="y2k-card p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-wordmark text-lg uppercase leading-none tracking-[-0.04em]">
              Transaksi Terbaru
            </h3>
            <Link
              href="/dashboard/transactions"
              className="font-display text-[9px] font-800 uppercase tracking-[0.12em] underline decoration-2 underline-offset-4"
            >
              Semua →
            </Link>
          </div>
          <RecentTransactions
            transactions={transactions.slice(0, 5)}
            currency={profile?.currency}
          />
        </section>
      </div>

      <QuickAddButton userId={profile?.id || ""} />
    </>
  );
}
