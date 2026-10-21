"use client";

import { useState } from "react";
import type { Profile, Transaction } from "@/lib/supabase/types";
import { calcMonthlyStats, formatCurrency, STATUS_CONFIG } from "@/utils/finance";
import { updateProfile } from "@/services/profile";
import { Save, Target, TrendingUp, TrendingDown, Wallet } from "lucide-react";
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
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto flex flex-col gap-4 animate-fade-in">

      <h1 className="font-display font-800 text-2xl">🎯 Budget Control</h1>

      {/* Current Status */}
      <div
        className={`${statusCfg.bg} border-3 border-neo-border rounded-2xl p-5`}
        style={{ boxShadow: "4px 4px 0px #1A1A1A" }}
      >
        <p className="text-sm font-display font-600 opacity-70 mb-1">Status Bulan Ini</p>
        <p className={`text-3xl font-display font-800 ${statusCfg.color}`}>
          {statusCfg.emoji} {statusCfg.label}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="neo-card p-3 text-center">
          <TrendingUp size={18} className="mx-auto mb-1 text-green-600" />
          <p className="text-xs text-neo-muted font-display">Pemasukan</p>
          <p className="font-mono font-700 text-sm">{formatCurrency(stats.totalIncome, profile?.currency, true)}</p>
        </div>
        <div className="neo-card p-3 text-center">
          <TrendingDown size={18} className="mx-auto mb-1 text-red-500" />
          <p className="text-xs text-neo-muted font-display">Pengeluaran</p>
          <p className="font-mono font-700 text-sm">{formatCurrency(stats.totalExpense, profile?.currency, true)}</p>
        </div>
        <div className="neo-card p-3 text-center">
          <Wallet size={18} className="mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-neo-muted font-display">Saldo</p>
          <p className={`font-mono font-700 text-sm ${stats.balance >= 0 ? "text-green-700" : "text-red-600"}`}>
            {formatCurrency(stats.balance, profile?.currency, true)}
          </p>
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
      <div className="neo-card p-4">
        <h3 className="font-display font-700 mb-3">📋 Aturan Budget</h3>
        <div className="flex flex-col gap-2">
          {[
            { color: "bg-brand-green", emoji: "✅", text: "< 80% budget → Status Sehat" },
            { color: "bg-brand-yellow", emoji: "⚠️", text: "80–100% budget → Peringatan" },
            { color: "bg-brand-red", emoji: "🚨", text: "> 100% budget → Over Budget!" },
            { color: "bg-brand-pink", emoji: "❌", text: "Pengeluaran > Pemasukan → Defisit!" },
          ].map((rule) => (
            <div key={rule.text} className="flex items-center gap-3">
              <div className={`w-7 h-7 ${rule.color} border-2 border-neo-border rounded-lg flex items-center justify-center text-sm shrink-0`}>
                {rule.emoji}
              </div>
              <span className="text-sm font-display font-600">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Set Budget Form */}
      <div className="neo-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} />
          <h3 className="font-display font-700">Atur Budget Bulanan</h3>
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
                  className={`px-3 py-1.5 rounded-lg border-2 border-neo-border text-sm font-display font-700 transition-all ${
                    Number(budget) === p.value
                      ? "bg-brand-yellow"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  style={Number(budget) === p.value ? { boxShadow: "2px 2px 0px #1A1A1A" } : {}}
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-700 text-neo-muted text-sm">
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
              <p className="text-xs text-neo-muted mt-1 font-mono">
                = {formatCurrency(Number(budget), profile?.currency)}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl px-3 py-2 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="neo-btn-yellow w-full h-12 text-base font-display font-700"
          >
            {saving ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : saved ? (
              "✅ Tersimpan!"
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
