"use client";

import { useState } from "react";
import type { Profile, Transaction } from "@/lib/supabase/types";
import { calcMonthlyStats, formatCurrency, STATUS_CONFIG } from "@/utils/finance";
import { updateProfile } from "@/services/profile";
import {
  AlertTriangle, Check, Save, Target, TrendingDown, TrendingUp, Wallet, X,
} from "lucide-react";
import BudgetBar from "@/components/dashboard/BudgetBar";

interface Props {
  profile: Profile | null;
  transactions: Transaction[];
}

export default function BudgetClient({ profile, transactions }: Props) {
  const [budget, setBudget] = useState(
    profile?.monthly_budget?.toString() || ""
  );
  const [budgetDisplay, setBudgetDisplay] = useState(
    profile?.monthly_budget
      ? Number(profile.monthly_budget).toLocaleString("id-ID")
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const currentBudget = profile?.monthly_budget || 0;
  const stats = calcMonthlyStats(transactions, currentBudget);
  const statusCfg = STATUS_CONFIG[stats.status];

  function handleBudgetChange(val: string) {
    const numeric = val.replace(/\D/g, "");
    setBudget(numeric);
    setBudgetDisplay(Number(numeric || 0).toLocaleString("id-ID"));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile(profile.id, {
        monthly_budget: Number(budget) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.location.reload();
    } catch {
      setError("Gagal menyimpan budget");
    } finally {
      setSaving(false);
    }
  }

  // Budget presets
  const PRESETS = [
    { label: "1jt", value: 1_000_000 },
    { label: "2jt", value: 2_000_000 },
    { label: "3jt", value: 3_000_000 },
    { label: "5jt", value: 5_000_000 },
    { label: "7jt", value: 7_000_000 },
    { label: "10jt", value: 10_000_000 },
  ];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-4 pt-1 animate-fade-in">

      <div>
        <p className="y2k-eyebrow">Kendali uang</p>
        <h1 className="mt-0.5 font-wordmark text-2xl uppercase leading-none tracking-[-0.04em]">
          Budget Control
        </h1>
      </div>

      {/* Current Status */}
      <div className="y2k-card p-5">
        <p className="y2k-eyebrow">Status bulan ini</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className={`font-wordmark text-2xl uppercase leading-none tracking-[-0.04em] ${statusCfg.color}`}>
            {statusCfg.label}
          </p>
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-3 border-y2k-ink shadow-hard-sm ${statusCfg.bg}`}
          >
            {stats.status === "healthy" ? (
              <Check size={22} strokeWidth={3.2} />
            ) : stats.status === "warning" ? (
              <AlertTriangle size={20} strokeWidth={3} />
            ) : (
              <X size={22} strokeWidth={3.2} />
            )}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border-2 border-y2k-ink bg-white p-2.5 text-center shadow-hard-sm">
          <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-lime">
            <TrendingUp size={14} strokeWidth={2.6} />
          </span>
          <p className="text-[9px] font-display font-700 uppercase tracking-wide text-y2k-muted">Masuk</p>
          <p className="font-mono text-[11px] font-700">{formatCurrency(stats.totalIncome, profile?.currency, true)}</p>
        </div>
        <div className="rounded-xl border-2 border-y2k-ink bg-white p-2.5 text-center shadow-hard-sm">
          <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-purple text-white">
            <TrendingDown size={14} strokeWidth={2.6} />
          </span>
          <p className="text-[9px] font-display font-700 uppercase tracking-wide text-y2k-muted">Keluar</p>
          <p className="font-mono text-[11px] font-700">{formatCurrency(stats.totalExpense, profile?.currency, true)}</p>
        </div>
        <div className="rounded-xl border-2 border-y2k-ink bg-white p-2.5 text-center shadow-hard-sm">
          <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-blue">
            <Wallet size={14} strokeWidth={2.6} />
          </span>
          <p className="text-[9px] font-display font-700 uppercase tracking-wide text-y2k-muted">Saldo</p>
          <p className="font-mono text-[11px] font-700">{formatCurrency(stats.balance, profile?.currency, true)}</p>
        </div>
      </div>

      {/* Budget Progress */}
      {currentBudget > 0 && (
        <BudgetBar
          budget={currentBudget}
          expense={stats.totalExpense}
          percent={stats.budgetUsedPercent}
          remaining={stats.remainingBudget}
          currency={profile?.currency}
          status={stats.status}
        />
      )}

      {/* Budget Rules Info */}
      <div className="y2k-card p-4">
        <h3 className="mb-3 font-wordmark text-base uppercase tracking-[-0.03em]">Aturan Budget</h3>
        <div className="flex flex-col gap-2.5">
          {[
            { color: "bg-brand-lime", text: "< 80% budget → Status Sehat" },
            { color: "bg-brand-orange", text: "80–100% budget → Peringatan" },
            { color: "bg-brand-red", text: "> 100% budget → Over Budget!" },
            { color: "bg-brand-pink", text: "Pengeluaran > Pemasukan → Defisit!" },
          ].map((rule) => (
            <div key={rule.text} className="flex items-center gap-3">
              <div className={`h-5 w-5 shrink-0 rounded-md border-2 border-y2k-ink ${rule.color}`} />
              <span className="font-display text-xs font-600">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Set Budget Form */}
      <div className="y2k-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-lime">
            <Target size={16} strokeWidth={2.6} />
          </span>
          <h3 className="font-wordmark text-base uppercase tracking-[-0.03em]">Atur Budget Bulanan</h3>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Quick Presets */}
          <div>
            <label className="neo-label text-xs">Pilih cepat</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setBudget(p.value.toString());
                    setBudgetDisplay(p.value.toLocaleString("id-ID"));
                  }}
                  className={`rounded-lg border-2 border-y2k-ink px-3 py-1.5 font-display text-xs font-700 transition-all ${
                    Number(budget) === p.value
                      ? "bg-brand-lime shadow-hard-sm"
                      : "bg-white hover:bg-y2k-lavender/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label className="neo-label">Atau isi manual (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-700 text-y2k-muted">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={budgetDisplay}
                onChange={(e) => handleBudgetChange(e.target.value)}
                placeholder="5.000.000"
                className="neo-input pl-12 font-mono font-700 text-xl"
              />
            </div>
            {budget && (
              <p className="mt-1 font-mono text-xs text-y2k-muted">
                = {formatCurrency(Number(budget), profile?.currency)}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neo-btn-yellow h-12 w-full text-base"
          >
            {saving ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : saved ? (
              "Tersimpan!"
            ) : (
              <>
                <Save size={18} />
                Simpan Budget
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
