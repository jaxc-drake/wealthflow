"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/utils/finance";
import { deleteTransaction } from "@/services/transactions";
import TransactionModal from "./TransactionModal";
import {
  Plus, Search, Trash2, Pencil,
  ArrowUpRight, ArrowDownLeft, Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Props {
  userId: string;
  transactions: Transaction[];
  currency: string;
}

type FilterType = "all" | "income" | "expense";

export default function TransactionsClient({ userId, transactions, currency }: Props) {
  const [list, setList] = useState(transactions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return list.filter((tx) => {
      const matchSearch =
        !search ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.source.toLowerCase().includes(search.toLowerCase()) ||
        (tx.description || "").toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "all" || tx.type === filterType;

      const matchMonth =
        !filterMonth || tx.date.startsWith(filterMonth);

      return matchSearch && matchType && matchMonth;
    });
  }, [list, search, filterType, filterMonth]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id, userId);
      setList((prev) => prev.filter((tx) => tx.id !== id));
    } catch {
      alert("Gagal menghapus transaksi");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSuccess() {
    setShowAdd(false);
    setEditTx(null);
    window.location.reload();
  }

  // Month options
  const monthOptions = useMemo(() => {
    const months = new Set(list.map((tx) => tx.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [list]);

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-1 animate-fade-in">

      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="y2k-eyebrow">Catatan uang</p>
          <h1 className="mt-0.5 font-wordmark text-2xl uppercase leading-none tracking-[-0.04em]">
            Transaksi
          </h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="neo-btn-yellow px-3 py-2 text-xs"
        >
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neo-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="neo-input pl-9 py-2.5 text-sm"
          />
        </div>

        <div className="flex gap-2">
          {/* Type filter */}
          <div className="flex border-3 border-neo-border rounded-xl overflow-hidden flex-1"
               style={{ boxShadow: "2px 2px 0px #1A1A1A" }}>
            {(["all", "income", "expense"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`flex-1 py-2 text-[10px] font-display font-800 uppercase tracking-wide transition-all ${
                  filterType === f
                    ? f === "income" ? "bg-brand-lime text-y2k-ink"
                      : f === "expense" ? "bg-brand-purple text-white"
                      : "bg-brand-lime text-y2k-ink"
                    : "bg-white text-y2k-muted"
                }`}
              >
                {f === "all" ? "Semua" : f === "income" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>

          {/* Month filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="neo-select text-xs py-2 px-2 flex-shrink-0"
            style={{ boxShadow: "2px 2px 0px #1A1A1A", maxWidth: 120 }}
          >
            <option value="">Semua Bulan</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {format(new Date(m + "-01"), "MMM yyyy", { locale: localeId })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="flex gap-2 mb-4 text-xs">
          <div className="flex-1 rounded-xl border-2 border-y2k-ink bg-brand-lime px-3 py-2 text-center shadow-hard-sm">
            <div className="mb-0.5 font-display text-[9px] font-800 uppercase tracking-[0.12em]">Total Masuk</div>
            <div className="font-mono text-xs font-700">
              {formatCurrency(
                filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
                currency, true
              )}
            </div>
          </div>
          <div className="flex-1 rounded-xl border-2 border-y2k-ink bg-brand-purple px-3 py-2 text-center text-white shadow-hard-sm">
            <div className="mb-0.5 font-display text-[9px] font-800 uppercase tracking-[0.12em]">Total Keluar</div>
            <div className="font-mono text-xs font-700">
              {formatCurrency(
                filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
                currency, true
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List grouped by date */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-y2k-ink bg-white shadow-hard">
            <Receipt size={24} strokeWidth={2.4} />
          </span>
          <p className="font-wordmark text-lg uppercase tracking-[-0.03em]">Belum ada transaksi</p>
          <p className="mt-1 text-sm text-y2k-muted">
            {search || filterType !== "all" || filterMonth
              ? "Coba ubah filter pencarian"
              : "Tap Tambah untuk mulai mencatat"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-lg border-2 border-y2k-ink bg-brand-lime px-2 py-0.5 font-mono text-[10px] font-700 shadow-hard-sm">
                  {formatDate(date)}
                </span>
                <div className="h-0.5 flex-1 bg-y2k-ink/20" />
              </div>

              <div className="flex flex-col gap-2">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl border-2 border-y2k-ink bg-white p-3 shadow-hard-sm"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-y2k-ink ${
                      tx.type === "income" ? "bg-brand-lime" : "bg-brand-purple text-white"
                    }`}>
                      {tx.type === "income"
                        ? <ArrowUpRight size={18} />
                        : <ArrowDownLeft size={18} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-display font-700 truncate">{tx.category}</p>
                          <p className="text-xs text-y2k-muted truncate">{tx.source}</p>
                          {tx.description && (
                            <p className="text-xs text-y2k-muted italic truncate">&ldquo;{tx.description}&rdquo;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-sm font-800 tracking-[-0.03em]">
                            {tx.type === "income" ? "+" : "−"}
                            {formatCurrency(tx.amount, currency, true)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditTx(tx)}
                        aria-label="Edit transaksi"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-blue transition-transform hover:scale-105"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        aria-label="Hapus transaksi"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-y2k-ink bg-brand-pink text-white transition-transform hover:scale-105"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <TransactionModal
          userId={userId}
          onClose={() => setShowAdd(false)}
          onSuccess={handleSuccess}
        />
      )}
      {editTx && (
        <TransactionModal
          userId={userId}
          editTransaction={editTx}
          onClose={() => setEditTx(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
