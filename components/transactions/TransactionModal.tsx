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
      <div
        className="relative w-full max-w-lg bg-white border-3 border-neo-border rounded-t-3xl sm:rounded-3xl p-5 pb-8 sm:pb-5 animate-slide-up"
        style={{ boxShadow: "0 -6px 0px #1A1A1A" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-700 text-xl">
            {editTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
          </h2>
          <button onClick={onClose} className="neo-btn-white w-9 h-9 p-0 justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-gray-100 border-3 border-neo-border rounded-xl">
          <button
            type="button"
            onClick={() => { setType("income"); setCategory(""); }}
            className={`flex-1 py-2.5 rounded-lg font-display font-700 text-sm transition-all ${
              type === "income"
                ? "bg-brand-green border-2 border-neo-border"
                : "text-neo-muted"
            }`}
            style={type === "income" ? { boxShadow: "2px 2px 0px #1A1A1A" } : {}}
          >
            📈 Pemasukan
          </button>
          <button
            type="button"
            onClick={() => { setType("expense"); setCategory(""); }}
            className={`flex-1 py-2.5 rounded-lg font-display font-700 text-sm transition-all ${
              type === "expense"
                ? "bg-brand-pink border-2 border-neo-border"
                : "text-neo-muted"
            }`}
            style={type === "expense" ? { boxShadow: "2px 2px 0px #1A1A1A" } : {}}
          >
            📉 Pengeluaran
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount */}
          <div>
            <label className="neo-label">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-700 text-neo-muted">
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
                  className={`px-3 py-1.5 rounded-lg border-2 border-neo-border text-xs font-display font-700 transition-all ${
                    category === cat
                      ? type === "income"
                        ? "bg-brand-green"
                        : "bg-brand-pink"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  style={category === cat ? { boxShadow: "2px 2px 0px #1A1A1A" } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="neo-label">
              {type === "income" ? "📥 Sumber Pemasukan" : "📤 Tujuan Pengeluaran"}
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
            <label className="neo-label">📅 Tanggal</label>
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
            <div className="bg-brand-red/20 border-2 border-brand-red rounded-xl px-3 py-2 text-sm font-display text-red-700">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 font-display font-700 text-base ${
              type === "income" ? "neo-btn-green" : "neo-btn-pink"
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
