"use client";

import { useState } from "react";
import type { Profile, Transaction } from "@/lib/supabase/types";
import {
  calcYearlyData,
  calcCategoryBreakdown,
  formatCurrency,
  formatDate,
} from "@/utils/finance";
import { exportToExcel } from "@/utils/export";
import { logExport } from "@/services/profile";
import { Download, FileSpreadsheet, Lock, AlertTriangle } from "lucide-react";
import YearlyChart from "@/components/charts/YearlyChart";

interface Props {
  profile: Profile | null;
  transactions: Transaction[];
  exportYear: number;
  alreadyExported: boolean;
  exportedAt: string | null;
  userId: string;
}

export default function ExportClient({
  profile,
  transactions,
  exportYear,
  alreadyExported,
  exportedAt,
  userId,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const yearlyData = calcYearlyData(transactions, exportYear);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const incomeBreakdown = calcCategoryBreakdown(transactions, "income");
  const expenseBreakdown = calcCategoryBreakdown(transactions, "expense");

  async function handleExport() {
    if (alreadyExported || done) return;
    if (!confirm(`Ekspor data ${exportYear}? Ini hanya bisa dilakukan 1x per tahun.`)) return;

    setExporting(true);
    setError("");

    try {
      // Log first (prevent double-click race)
      await logExport(userId, exportYear);
      // Then download
      exportToExcel(transactions, profile!, exportYear);
      setDone(true);
    } catch (err: any) {
      if (err?.code === "23505") {
        // duplicate key = already exported
        setError("Kamu sudah pernah mengekspor data tahun ini.");
      } else {
        setError("Gagal mengekspor data: " + (err?.message || ""));
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto flex flex-col gap-4 animate-fade-in">

      <h1 className="font-display font-800 text-2xl">📤 Export Data</h1>

      {/* Year Summary */}
      <div className="neo-card p-4 bg-brand-yellow border-3 border-neo-border"
           style={{ boxShadow: "4px 4px 0px #1A1A1A" }}>
        <p className="font-display font-700 text-sm mb-3">📊 Ringkasan {exportYear}</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-neo-muted font-display mb-0.5">Pemasukan</p>
            <p className="font-mono font-700 text-sm">
              {formatCurrency(totalIncome, profile?.currency, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neo-muted font-display mb-0.5">Pengeluaran</p>
            <p className="font-mono font-700 text-sm">
              {formatCurrency(totalExpense, profile?.currency, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neo-muted font-display mb-0.5">Net</p>
            <p className={`font-mono font-700 text-sm ${
              totalIncome - totalExpense >= 0 ? "text-green-800" : "text-red-700"
            }`}>
              {formatCurrency(totalIncome - totalExpense, profile?.currency, true)}
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-neo-muted mt-3 font-display">
          {transactions.length} transaksi tersimpan
        </p>
      </div>

      {/* Yearly Chart */}
      {transactions.length > 0 && (
        <div className="neo-card p-4">
          <h3 className="font-display font-700 mb-3">Tren {exportYear}</h3>
          <YearlyChart data={yearlyData} />
        </div>
      )}

      {/* Category Preview */}
      {expenseBreakdown.length > 0 && (
        <div className="neo-card p-4">
          <h3 className="font-display font-700 mb-3">Top Pengeluaran {exportYear}</h3>
          <div className="flex flex-col gap-1.5">
            {expenseBreakdown.slice(0, 5).map((item, i) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-mono font-700 bg-brand-pink border-2 border-neo-border rounded">
                    {i + 1}
                  </span>
                  <span className="text-sm font-display font-600">{item.category}</span>
                </div>
                <span className="font-mono text-sm font-700">
                  {formatCurrency(item.total, profile?.currency, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Info */}
      <div className="neo-card p-4 border-brand-orange">
        <div className="flex gap-3 mb-3">
          <AlertTriangle size={20} className="text-brand-orange shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-700 text-sm">Penting!</p>
            <p className="text-xs text-neo-muted mt-0.5 leading-relaxed">
              Export data hanya bisa dilakukan <strong>1 kali per tahun</strong>.
              File Excel akan berisi semua transaksi, ringkasan bulanan, dan breakdown kategori.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs font-display">
          <p className="flex items-center gap-2">
            <FileSpreadsheet size={14} />
            Sheet 1: Semua Transaksi ({transactions.length} baris)
          </p>
          <p className="flex items-center gap-2">
            <FileSpreadsheet size={14} />
            Sheet 2: Ringkasan Per Bulan
          </p>
          <p className="flex items-center gap-2">
            <FileSpreadsheet size={14} />
            Sheet 3: Breakdown Kategori
          </p>
        </div>
      </div>

      {/* Already Exported */}
      {(alreadyExported || done) && (
        <div className="flex items-center gap-3 p-4 bg-gray-100 border-3 border-neo-border rounded-2xl">
          <Lock size={20} className="text-neo-muted shrink-0" />
          <div>
            <p className="font-display font-700 text-sm">Sudah Diekspor</p>
            <p className="text-xs text-neo-muted">
              {done
                ? "File berhasil diunduh!"
                : exportedAt
                ? `Diekspor pada ${formatDate(exportedAt.split("T")[0])}`
                : ""}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-red-700 font-display">
          ⚠️ {error}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={alreadyExported || done || exporting || transactions.length === 0}
        className={`neo-btn w-full h-14 text-base font-display font-700 ${
          alreadyExported || done
            ? "bg-gray-200 text-neo-muted cursor-not-allowed border-gray-300"
            : "neo-btn-black"
        }`}
        style={!(alreadyExported || done) ? { boxShadow: "4px 4px 0px #1A1A1A" } : {}}
      >
        {exporting ? (
          <span className="animate-pulse">Mengekspor...</span>
        ) : done ? (
          "✅ File Terunduh!"
        ) : alreadyExported ? (
          <>
            <Lock size={18} /> Sudah Digunakan
          </>
        ) : transactions.length === 0 ? (
          "Tidak Ada Data"
        ) : (
          <>
            <Download size={18} />
            Export ke Excel (.xlsx)
          </>
        )}
      </button>

      {transactions.length === 0 && (
        <p className="text-center text-sm text-neo-muted font-display">
          Belum ada transaksi di tahun {exportYear}
        </p>
      )}
    </div>
  );
}
