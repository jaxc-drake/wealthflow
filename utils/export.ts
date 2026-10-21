import * as XLSX from "xlsx";
import type { Transaction, Profile } from "@/lib/supabase/types";
import { formatCurrency, calcCategoryBreakdown, calcYearlyData } from "./finance";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function exportToExcel(
  transactions: Transaction[],
  profile: Profile,
  year: number
): void {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: All Transactions ──
  const txRows = transactions.map((t) => ({
    Tanggal: format(new Date(t.date), "dd/MM/yyyy"),
    Tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
    Kategori: t.category,
    Sumber: t.source,
    Deskripsi: t.description || "-",
    Jumlah: t.amount,
    "Jumlah (Format)": formatCurrency(t.amount, profile.currency),
  }));

  const txSheet = XLSX.utils.json_to_sheet(txRows);
  txSheet["!cols"] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 25 },
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, txSheet, "Transaksi");

  // ── Sheet 2: Monthly Summary ──
  const yearlyData = calcYearlyData(transactions, year);
  const summaryRows = yearlyData.map((d) => ({
    Bulan: d.month,
    "Total Pemasukan": d.income,
    "Total Pengeluaran": d.expense,
    "Net Balance": d.balance,
    "Pemasukan (Format)": formatCurrency(d.income, profile.currency),
    "Pengeluaran (Format)": formatCurrency(d.expense, profile.currency),
    "Balance (Format)": formatCurrency(d.balance, profile.currency),
  }));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  summaryRows.push({
    Bulan: "TOTAL",
    "Total Pemasukan": totalIncome,
    "Total Pengeluaran": totalExpense,
    "Net Balance": totalIncome - totalExpense,
    "Pemasukan (Format)": formatCurrency(totalIncome, profile.currency),
    "Pengeluaran (Format)": formatCurrency(totalExpense, profile.currency),
    "Balance (Format)": formatCurrency(totalIncome - totalExpense, profile.currency),
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet["!cols"] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan Bulanan");

  // ── Sheet 3: Category Breakdown ──
  const incomeBreakdown = calcCategoryBreakdown(transactions, "income");
  const expenseBreakdown = calcCategoryBreakdown(transactions, "expense");

  const maxLen = Math.max(incomeBreakdown.length, expenseBreakdown.length);
  const breakdownRows = Array.from({ length: maxLen }, (_, i) => ({
    "Kategori Pemasukan": incomeBreakdown[i]?.category || "",
    "Jumlah Pemasukan": incomeBreakdown[i]?.total || "",
    "% Pemasukan": incomeBreakdown[i]
      ? `${incomeBreakdown[i].percent.toFixed(1)}%`
      : "",
    _sep: "",
    "Kategori Pengeluaran": expenseBreakdown[i]?.category || "",
    "Jumlah Pengeluaran": expenseBreakdown[i]?.total || "",
    "% Pengeluaran": expenseBreakdown[i]
      ? `${expenseBreakdown[i].percent.toFixed(1)}%`
      : "",
  }));

  const breakdownSheet = XLSX.utils.json_to_sheet(breakdownRows);
  XLSX.utils.book_append_sheet(wb, breakdownSheet, "Breakdown Kategori");

  // ── Download ──
  const filename = `WealthFlow_${profile.full_name || "User"}_${year}.xlsx`;
  XLSX.writeFile(wb, filename);
}
