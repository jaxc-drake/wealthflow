"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/utils/finance";
import { deleteTransaction } from "@/services/transactions";
import TransactionModal from "./TransactionModal";
import {
  Plus, Search, Trash2, Pencil,
  ArrowUpRight, ArrowDownLeft, Filter,
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
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-800 text-2xl">Transaksi</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="neo-btn-yellow px-3 py-2 text-sm"
        >
          <Plus size={16} /> Tambah
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
                className={`flex-1 py-2 text-xs font-display font-700 transition-all ${
                  filterType === f
                    ? f === "income" ? "bg-brand-green"
                      : f === "expense" ? "bg-brand-pink"
                      : "bg-brand-yellow"
                    : "bg-white text-neo-muted"
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
          <div className="flex-1 bg-brand-green border-2 border-neo-border rounded-xl px-3 py-2 text-center"
               style={{ boxShadow: "2px 2px 0px #1A1A1A" }}>
            <div className="font-display font-600 text-neo-muted mb-0.5">Total Masuk</div>
            <div className="font-mono font-700">
              {formatCurrency(
                filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
                currency, true
              )}
            </div>
          </div>
          <div className="flex-1 bg-brand-pink border-2 border-neo-border rounded-xl px-3 py-2 text-center"
               style={{ boxShadow: "2px 2px 0px #1A1A1A" }}>
            <div className="font-display font-600 text-neo-muted mb-0.5">Total Keluar</div>
            <div className="font-mono font-700">
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
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-display font-700 text-lg">Belum ada transaksi</p>
          <p className="text-sm text-neo-muted mt-1">
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
                <span className="text-xs font-display font-700 bg-brand-yellow border-2 border-neo-border px-2 py-0.5 rounded-lg"
                      style={{ boxShadow: "1px 1px 0px #1A1A1A" }}>
                  {formatDate(date)}
                </span>
                <div className="flex-1 h-px bg-neo-border" />
              </div>

              <div className="flex flex-col gap-2">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="neo-card p-3 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl border-2 border-neo-border flex items-center justify-center shrink-0 ${
                      tx.type === "income" ? "bg-brand-green" : "bg-brand-pink"
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
                          <p className="text-xs text-neo-muted truncate">{tx.source}</p>
                          {tx.description && (
                            <p className="text-xs text-neo-muted italic truncate">&ldquo;{tx.description}&rdquo;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-mono font-700 text-sm ${
                            tx.type === "income" ? "text-green-700" : "text-red-600"
                          }`}>
                            {tx.type === "income" ? "+" : "-"}
                            {formatCurrency(tx.amount, currency, true)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditTx(tx)}
                        className="w-7 h-7 flex items-center justify-center border-2 border-neo-border rounded-lg bg-brand-blue hover:scale-105 transition-transform"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="w-7 h-7 flex items-center justify-center border-2 border-neo-border rounded-lg bg-brand-red hover:scale-105 transition-transform"
                      >
                        <Trash2 size={12} className="text-white" />
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
