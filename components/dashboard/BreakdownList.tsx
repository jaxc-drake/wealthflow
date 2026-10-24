import type { CategoryBreakdown } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/finance";

const INCOME_COLORS = ["bg-brand-lime", "bg-brand-blue", "bg-brand-purple", "bg-brand-pink", "bg-brand-orange"];
const EXPENSE_COLORS = ["bg-brand-purple", "bg-brand-lime", "bg-brand-pink", "bg-brand-blue", "bg-brand-orange"];

interface Props {
  items: CategoryBreakdown[];
  currency?: string;
  type: "income" | "expense";
}

export default function BreakdownList({ items, currency, type }: Props) {
  const colors = type === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  if (!items.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-y2k-ink/30 bg-y2k-lavender/50 px-3 py-6 text-center">
        <p className="font-display text-xs font-700 uppercase tracking-wide text-y2k-muted">
          Belum ada data bulan ini
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, 5).map((item, i) => (
        <div key={item.category} className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-y2k-ink bg-y2k-ink font-mono text-xs font-800 text-white">
            {i + 1}
          </span>

          <span className="w-[74px] shrink-0 truncate font-display text-[11px] font-700 leading-tight">
            {item.category}
          </span>

          <div className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-y2k-ink bg-[#E4E0F2]">
            <div
              className={`pixel-meter h-full ${colors[i % colors.length]}`}
              style={{ width: `${Math.max(item.percent, 5)}%` }}
            />
          </div>

          <span className="w-[72px] shrink-0 text-right font-mono text-[10px] font-700 leading-tight">
            {formatCurrency(item.total, currency, true)}
          </span>
        </div>
      ))}
    </div>
  );
}
