"use client";

import { useState } from "react";
import type { Profile, Transaction } from "@/lib/supabase/types";
import {
  calcMonthlyStats,
  calcYearlyData,
  calcCategoryBreakdown,
  calcTopSources,
  formatCurrency,
  STATUS_CONFIG,
  getCurrentYear,
} from "@/utils/finance";
import StatusCard from "@/components/dashboard/StatusCard";
import BudgetBar from "@/components/dashboard/BudgetBar";
import MonthlyChart from "@/components/charts/MonthlyChart";
import YearlyChart from "@/components/charts/YearlyChart";
import BreakdownList from "@/components/dashboard/BreakdownList";
import QuickAddButton from "@/components/transactions/QuickAddButton";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  profile: Profile | null;
  transactions: Transaction[];
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
  const yearlyData = calcYearlyData(transactions, viewYear);
  const incomeBreakdown = calcCategoryBreakdown(transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  }), "income");
  const expenseBreakdown = calcCategoryBreakdown(transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  }), "expense");
  const topIncomeSources = calcTopSources(transactions, "income", 3);
  const statusCfg = STATUS_CONFIG[stats.status];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto flex flex-col gap-4 animate-fade-in">

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="neo-btn-white w-9 h-9 p-0 justify-center">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display font-700 text-lg capitalize">
          {format(viewDate, "MMMM yyyy", { locale: localeId })}
        </h2>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`neo-btn-white w-9 h-9 p-0 justify-center ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Status Banner */}
      <div
        className={`${statusCfg.bg} border-3 border-neo-border rounded-2xl p-4 flex items-center justify-between`}
        style={{ boxShadow: "4px 4px 0px #1A1A1A" }}
      >
        <div>
          <p className="text-xs font-display font-600 opacity-70 mb-0.5">Status Keuangan</p>
          <p className={`text-xl font-display font-800 ${statusCfg.color}`}>
            {statusCfg.emoji} {statusCfg.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-display font-600 opacity-70 mb-0.5">Saldo</p>
          <p className="font-mono font-700 text-lg">
            {formatCurrency(stats.balance, profile?.currency, true)}
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard
          label="Pemasukan"
          value={stats.totalIncome}
          currency={profile?.currency}
          emoji="📈"
          color="bg-brand-green"
        />
        <StatusCard
          label="Pengeluaran"
          value={stats.totalExpense}
          currency={profile?.currency}
          emoji="📉"
          color="bg-brand-pink"
        />
      </div>

      {/* Budget Bar */}
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

      {/* Quick Add Button */}
      <QuickAddButton userId={profile?.id || ""} />

      {/* Monthly Chart */}
      <div className="neo-card p-4">
        <h3 className="font-display font-700 mb-3">Bulan Ini vs Bulan Lalu</h3>
        <MonthlyChart
          currentIncome={stats.totalIncome}
          currentExpense={stats.totalExpense}
          yearlyData={yearlyData}
          currentMonth={viewMonth}
        />
      </div>

      {/* Yearly Trend */}
      <div className="neo-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-700">Tren {viewYear}</h3>
          <span className="text-xs neo-badge bg-brand-blue">12 Bulan</span>
        </div>
        <YearlyChart data={yearlyData} />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 gap-3">
        <div className="neo-card p-4">
          <h3 className="font-display font-700 mb-3">📈 Top Pemasukan</h3>
          <BreakdownList items={incomeBreakdown} currency={profile?.currency} type="income" />
        </div>
        <div className="neo-card p-4">
          <h3 className="font-display font-700 mb-3">📉 Top Pengeluaran</h3>
          <BreakdownList items={expenseBreakdown} currency={profile?.currency} type="expense" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="neo-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-700">Transaksi Terbaru</h3>
        </div>
        <RecentTransactions
          transactions={transactions.slice(0, 5)}
          currency={profile?.currency}
        />
      </div>
    </div>
  );
}
