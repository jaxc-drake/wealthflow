import type { Transaction } from "@/lib/supabase/types";
import { formatCurrency, formatDate } from "@/utils/finance";
import {
  Briefcase, Car, CreditCard, Film, Gift, GraduationCap, Heart, Laptop,
  MoreHorizontal, PiggyBank, Receipt, ShoppingBag, Store, TrendingUp,
  Utensils, type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Props {
  transactions: Transaction[];
  currency?: string;
}

const ICONS: Record<string, LucideIcon> = {
  "Makan & Minum": Utensils,
  Transport: Car,
  Belanja: ShoppingBag,
  Kesehatan: Heart,
  Hiburan: Film,
  Pendidikan: GraduationCap,
  Tagihan: Receipt,
  Cicilan: CreditCard,
  Tabungan: PiggyBank,
  Gaji: Briefcase,
  Freelance: Laptop,
  Bisnis: Store,
  Investasi: TrendingUp,
  Bonus: Gift,
  Hadiah: Gift,
  Lainnya: MoreHorizontal,
};

const TILE_STYLES: Record<string, string> = {
  "Makan & Minum": "bg-brand-pink text-white",
  Transport: "bg-brand-lime text-y2k-ink",
  Belanja: "bg-brand-blue text-y2k-ink",
  Kesehatan: "bg-brand-orange text-y2k-ink",
  Hiburan: "bg-brand-purple text-white",
  Pendidikan: "bg-brand-purple text-white",
  Tagihan: "bg-brand-blue text-y2k-ink",
  Cicilan: "bg-brand-orange text-y2k-ink",
  Tabungan: "bg-brand-lime text-y2k-ink",
  Gaji: "bg-brand-purple text-white",
  Freelance: "bg-brand-purple text-white",
  Bisnis: "bg-brand-purple text-white",
  Investasi: "bg-brand-lime text-y2k-ink",
  Bonus: "bg-brand-pink text-white",
  Hadiah: "bg-brand-pink text-white",
};

function formatTxDate(tx: Transaction) {
  const value = tx.created_at || tx.date;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(tx.date);
  return format(date, "dd MMM yyyy, HH:mm", { locale: localeId });
}

export default function RecentTransactions({ transactions, currency }: Props) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center py-7 text-center">
        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-y2k-ink bg-y2k-lavender shadow-hard-sm">
          <Receipt size={20} strokeWidth={2.4} />
        </span>
        <p className="font-display text-sm font-700">Belum ada transaksi</p>
        <p className="mt-0.5 text-xs text-y2k-muted">Tap tombol + untuk mulai mencatat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {transactions.map((tx) => {
        const Icon = ICONS[tx.category] || (tx.type === "income" ? Briefcase : Receipt);
        const tile = TILE_STYLES[tx.category] || (tx.type === "income"
          ? "bg-brand-purple text-white"
          : "bg-brand-pink text-white");

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 border-b-2 border-y2k-ink/15 py-2.5 last:border-b-0 last:pb-0 first:pt-1"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-y2k-ink ${tile}`}>
              <Icon size={18} strokeWidth={2.6} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[13px] font-700 leading-tight">
                {tx.source}
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wide text-y2k-muted">
                {formatTxDate(tx)} · {tx.category}
              </p>
            </div>

            <p className="shrink-0 font-mono text-xs font-800 tracking-[-0.03em]">
              {tx.type === "income" ? "+" : "−"}
              {formatCurrency(tx.amount, currency)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
