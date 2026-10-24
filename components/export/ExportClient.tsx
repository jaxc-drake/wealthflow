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
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-4 pt-1 animate-fade-in">

      <div>
        <p className="y2k-eyebrow">Arsip tahunan</p>
        <h1 className="mt-0.5 font-wordmark text-2xl uppercase leading-none tracking-[-0.04em]">
          Export Data
        </h1>
      </div>

      {/* Year Summary */}
      <div className="y2k-card bg-brand-lime p-4">
        <p className="mb-3 font-wordmark text-base uppercase tracking-[-0.03em]">
          Ringkasan {exportYear}
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="mb-0.5 font-display text-[9px] font-800 uppercase tracking-wide">Pemasukan</p>
            <p className="font-mono text-xs font-700">
              {formatCurrency(totalIncome, profile?.currency, true)}
            </p>
          </div>
          <div>
            <p className="mb-0.5 font-display text-[9px] font-800 uppercase tracking-wide">Pengeluaran</p>
            <p className="font-mono text-xs font-700">
              {formatCurrency(totalExpense, profile?.currency, true)}
            </p>
          </div>
          <div>
            <p className="mb-0.5 font-display text-[9px] font-800 uppercase tracking-wide">Net</p>
            <p className="font-mono text-xs font-700">
              {formatCurrency(totalIncome - totalExpense, profile?.currency, true)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-center font-display text-[10px] font-700 uppercase tracking-wide">
          {transactions.length} transaksi tersimpan
        </p>
      </div>

      {/* Yearly Chart */}
      {transactions.length > 0 && (
        <div className="y2k-card p-4">
          <h3 className="mb-3 font-wordmark text-base uppercase tracking-[-0.03em]">Tren {exportYear}</h3>
          <YearlyChart data={yearlyData} />
        </div>
      )}

      {/* Category Preview */}
      {expenseBreakdown.length > 0 && (
        <div className="y2k-card p-4">
          <h3 className="mb-3 font-wordmark text-base uppercase tracking-[-0.03em]">Top Pengeluaran {exportYear}</h3>
          <div className="flex flex-col gap-2">
            {expenseBreakdown.slice(0, 5).map((item, i) => (
              <div key={item.category} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-y2k-ink bg-brand-purple font-mono text-[10px] font-700 text-white">
                    {i + 1}
                  </span>
                  <span className="truncate font-display text-xs font-600">{item.category}</span>
                </div>
                <span className="shrink-0 font-mono text-xs font-700">
                  {formatCurrency(item.total, profile?.currency, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Info */}
      <div className="y2k-card border-brand-orange p-4">
        <div className="mb-3 flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-orange">
            <AlertTriangle size={16} strokeWidth={2.6} />
          </span>
          <div>
            <p className="font-wordmark text-sm uppercase tracking-[-0.02em]">Penting!</p>
            <p className="mt-0.5 text-xs leading-relaxed text-y2k-muted">
              Export data hanya bisa dilakukan <strong className="text-y2k-ink">1 kali per tahun</strong>.
              File Excel akan berisi semua transaksi, ringkasan bulanan, dan breakdown kategori.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 font-display text-xs">
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
        <div className="flex items-center gap-3 rounded-2xl border-3 border-y2k-ink bg-y2k-lavender p-4 shadow-hard-sm">
          <Lock size={20} className="shrink-0 text-y2k-muted" />
          <div>
            <p className="font-display text-sm font-700">Sudah Diekspor</p>
            <p className="text-xs text-y2k-muted">
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
        <div className="rounded-xl border-2 border-brand-red bg-brand-red/10 px-4 py-3 font-display text-sm text-brand-red">
          {error}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={alreadyExported || done || exporting || transactions.length === 0}
        className={`neo-btn h-14 w-full text-base ${
          alreadyExported || done
            ? "cursor-not-allowed border-y2k-ink/30 bg-gray-200 text-y2k-muted shadow-none"
            : "neo-btn-black"
        }`}
      >
        {exporting ? (
          <span className="animate-pulse">Mengekspor...</span>
        ) : done ? (
          "File Terunduh!"
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
        <p className="text-center font-display text-sm text-y2k-muted">
          Belum ada transaksi di tahun {exportYear}
        </p>
      )}
    </div>
  );
}
