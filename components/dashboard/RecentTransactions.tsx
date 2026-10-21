import type { Transaction } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/utils/finance";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Props {
  transactions: Transaction[];
  currency?: string;
}

export default function RecentTransactions({ transactions, currency }: Props) {
  if (!transactions.length) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm text-neo-muted font-display">Belum ada transaksi</p>
        <p className="text-xs text-neo-muted mt-1">Tap tombol + untuk mulai mencatat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 p-2 rounded-xl border-2 border-neo-border bg-neo-bg"
          style={{ boxShadow: "2px 2px 0px #1A1A1A" }}
        >
          <div className={`w-9 h-9 rounded-lg border-2 border-neo-border flex items-center justify-center shrink-0 ${
            tx.type === "income" ? "bg-brand-green" : "bg-brand-pink"
          }`}>
            {tx.type === "income"
              ? <ArrowUpRight size={16} />
              : <ArrowDownLeft size={16} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-700 truncate">{tx.category}</p>
            <p className="text-xs text-neo-muted truncate">{tx.source}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-mono font-700 ${
              tx.type === "income" ? "text-green-700" : "text-red-600"
            }`}>
              {tx.type === "income" ? "+" : "-"}
              {formatCurrency(tx.amount, currency, true)}
            </p>
            <p className="text-xs text-neo-muted">{formatDate(tx.date)}</p>
          </div>
        </div>
      ))}
      <Link
        href="/dashboard/transactions"
        className="neo-btn-white w-full mt-1 text-sm justify-center"
      >
        Lihat Semua Transaksi →
      </Link>
    </div>
  );
}
