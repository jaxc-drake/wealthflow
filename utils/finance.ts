import type {
  Transaction,
  MonthlyStats,
  YearlyData,
  CategoryBreakdown,
  FinancialStatus,
} from "@/lib/supabase/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";

// ============================================
// CURRENCY FORMATTER
// ============================================
export function formatCurrency(
  amount: number,
  currency = "IDR",
  compact = false
): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const m = amount / 1_000_000;
    return `Rp ${m.toFixed(1)}jt`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    const k = amount / 1_000;
    return `Rp ${k.toFixed(0)}rb`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// BUDGET STATUS
// ============================================
export function getBudgetStatus(
  totalExpense: number,
  budget: number,
  totalIncome: number
): FinancialStatus {
  if (totalExpense > totalIncome) return "loss";
  if (budget > 0 && totalExpense > budget) return "over_budget";
  if (budget > 0 && totalExpense >= budget * 0.8) return "warning";
  return "healthy";
}

export function getBudgetPercent(expense: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((expense / budget) * 100, 999);
}

// ============================================
// MONTHLY STATS
// ============================================
export function calcMonthlyStats(
  transactions: Transaction[],
  budget: number,
  month?: Date
): MonthlyStats {
  const now = month || new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const monthly = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const totalIncome = monthly
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthly
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const budgetUsedPercent = getBudgetPercent(totalExpense, budget);
  const remainingBudget = budget > 0 ? budget - totalExpense : 0;
  const status = getBudgetStatus(totalExpense, budget, totalIncome);

  return {
    totalIncome,
    totalExpense,
    balance,
    budget,
    budgetUsedPercent,
    remainingBudget,
    status,
  };
}

// ============================================
// YEARLY TREND DATA
// ============================================
export function calcYearlyData(
  transactions: Transaction[],
  year?: number
): YearlyData[] {
  const targetYear = year || new Date().getFullYear();
  const start = startOfYear(new Date(targetYear, 0, 1));
  const end = endOfYear(new Date(targetYear, 0, 1));
  const months = eachMonthOfInterval({ start, end });

  return months.map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd;
    });

    const income = monthly
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthly
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(monthDate, "MMM", { locale: localeId }),
      income,
      expense,
      balance: income - expense,
    };
  });
}

// ============================================
// RECENT MONTHS (dashboard trend)
// ============================================
export function calcRecentMonths(
  transactions: Transaction[],
  endDate: Date = new Date(),
  count = 6
): YearlyData[] {
  const end = startOfMonth(endDate);

  return Array.from({ length: count }, (_, i) => {
    const monthDate = subMonths(end, count - 1 - i);
    const start = startOfMonth(monthDate);
    const finish = endOfMonth(monthDate);

    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= finish;
    });

    const income = monthly
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthly
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(monthDate, "MMM", { locale: localeId }),
      income,
      expense,
      balance: income - expense,
    };
  });
}

// ============================================
// CATEGORY BREAKDOWN
// ============================================
export function calcCategoryBreakdown(
  transactions: Transaction[],
  type: "income" | "expense"
): CategoryBreakdown[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const grouped = filtered.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = { total: 0, count: 0 };
      acc[t.category].total += t.amount;
      acc[t.category].count++;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  return Object.entries(grouped)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percent: total > 0 ? (data.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ============================================
// TOP SOURCES
// ============================================
export function calcTopSources(
  transactions: Transaction[],
  type: "income" | "expense",
  limit = 5
): { source: string; total: number; count: number }[] {
  const filtered = transactions.filter((t) => t.type === type);

  const grouped = filtered.reduce(
    (acc, t) => {
      if (!acc[t.source]) acc[t.source] = { total: 0, count: 0 };
      acc[t.source].total += t.amount;
      acc[t.source].count++;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  return Object.entries(grouped)
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ============================================
// DATE HELPERS
// ============================================
export function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), "yyyy-MM-dd"),
    end: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy", { locale: localeId });
}

// ============================================
// CATEGORIES CONFIG
// ============================================
export const INCOME_CATEGORIES = [
  "Gaji",
  "Freelance",
  "Bisnis",
  "Investasi",
  "Bonus",
  "Hadiah",
  "Lainnya",
];

export const EXPENSE_CATEGORIES = [
  "Makan & Minum",
  "Transport",
  "Belanja",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Tagihan",
  "Cicilan",
  "Tabungan",
  "Lainnya",
];

export const STATUS_CONFIG: Record<
  FinancialStatus,
  { label: string; emoji: string; color: string; bg: string }
> = {
  healthy: {
    label: "Sehat",
    emoji: "✅",
    color: "text-green-700",
    bg: "bg-brand-green",
  },
  warning: {
    label: "Hampir Limit",
    emoji: "⚠️",
    color: "text-yellow-800",
    bg: "bg-brand-yellow",
  },
  over_budget: {
    label: "Over Budget!",
    emoji: "🚨",
    color: "text-red-700",
    bg: "bg-brand-red",
  },
  loss: {
    label: "Defisit!",
    emoji: "❌",
    color: "text-red-900",
    bg: "bg-brand-pink",
  },
};
