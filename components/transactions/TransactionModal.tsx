"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { createTransaction, updateTransaction } from "@/services/transactions";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  formatCurrency,
} from "@/utils/finance";
import type { Transaction } from "@/lib/supabase/types";
import { format } from "date-fns";

interface Props {
  userId: string;
  defaultType?: "income" | "expense";
  editTransaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionModal({
  userId,
  defaultType = "expense",
  editTransaction,
  onClose,
  onSuccess,
}: Props) {
  const [type, setType] = useState<"income" | "expense">(
    editTransaction?.type || defaultType
  );
  const [amount, setAmount] = useState(
    editTransaction?.amount?.toString() || ""
  );
  const [category, setCategory] = useState(editTransaction?.category || "");
  const [source, setSource] = useState(editTransaction?.source || "");
  const [description, setDescription] = useState(
    editTransaction?.description || ""
  );
  const [date, setDate] = useState(
    editTransaction?.date || format(new Date(), "yyyy-MM-dd")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Format amount display
  const displayAmount = amount
    ? Number(amount.replace(/\D/g, "")).toLocaleString("id-ID")
    : "";

  function handleAmountChange(val: string) {
    const numeric = val.replace(/\D/g, "");
    setAmount(numeric);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Jumlah harus lebih dari 0");
      return;
    }
    if (!category) {
      setError("Pilih kategori");
      return;
    }
    if (!source.trim()) {
      setError(
        type === "income"
          ? "Isi sumber pemasukan (contoh: Gaji PT XYZ)"
          : "Isi tujuan pengeluaran (contoh: Warteg Bu Siti)"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, userId, {
          type,
          amount: numAmount,
          category,
          source: source.trim(),
          description: description.trim() || null,
          date,
        });
      } else {
        await createTransaction({
          user_id: userId,
          type,
          amount: numAmount,
          category,
          source: source.trim(),
          description: description.trim() || null,
          date,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan transaksi");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="animate-slide-up relative w-full max-w-lg rounded-t-3xl border-4 border-b-0 border-y2k-ink bg-white p-5 pb-8 shadow-[0_-6px_0_#0A0A0A] sm:rounded-3xl sm:border-b-4 sm:pb-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-wordmark text-xl uppercase tracking-[-0.03em]">
            {editTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="neo-btn-white h-9 w-9 justify-center p-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="mb-5 flex gap-2 rounded-xl border-3 border-y2k-ink bg-y2k-lavender p-1">
          <button
            type="button"
            onClick={() => { setType("income"); setCategory(""); }}
            className={`flex-1 rounded-lg py-2.5 font-display text-xs font-800 uppercase tracking-wide transition-all ${
              type === "income"
                ? "border-2 border-y2k-ink bg-brand-lime shadow-hard-sm"
                : "text-y2k-muted"
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => { setType("expense"); setCategory(""); }}
            className={`flex-1 rounded-lg py-2.5 font-display text-xs font-800 uppercase tracking-wide transition-all ${
              type === "expense"
                ? "border-2 border-y2k-ink bg-brand-purple text-white shadow-hard-sm"
                : "text-y2k-muted"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount */}
          <div>
            <label className="neo-label">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-700 text-y2k-muted">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="neo-input pl-12 font-mono font-700 text-xl"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="neo-label">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg border-2 border-y2k-ink px-3 py-1.5 font-display text-[11px] font-700 transition-all ${
                    category === cat
                      ? type === "income"
                        ? "bg-brand-lime shadow-hard-sm"
                        : "bg-brand-purple text-white shadow-hard-sm"
                      : "bg-white hover:bg-y2k-lavender/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="neo-label">
              {type === "income" ? "Sumber Pemasukan" : "Tujuan Pengeluaran"}
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={
                type === "income"
                  ? "contoh: PT Maju Jaya, Freelance Desain..."
                  : "contoh: Warteg Bu Siti, Grab, Alfamart..."
              }
              className="neo-input"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="neo-label">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="neo-input font-mono"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="neo-label">Catatan (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambah catatan..."
              rows={2}
              className="neo-input resize-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border-2 border-brand-red bg-brand-red/10 px-3 py-2 font-display text-sm text-brand-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`h-12 w-full text-base ${
              type === "income" ? "neo-btn-green" : "neo-btn-purple"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <Save size={18} />
                {editTransaction ? "Simpan Perubahan" : "Simpan Transaksi"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
