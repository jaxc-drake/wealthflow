import type { CategoryBreakdown } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/finance";

const INCOME_COLORS = ["bg-brand-green", "bg-brand-blue", "bg-brand-yellow", "bg-brand-purple", "bg-neo-bg"];
const EXPENSE_COLORS = ["bg-brand-pink", "bg-brand-orange", "bg-brand-yellow", "bg-brand-purple", "bg-neo-bg"];

interface Props {
  items: CategoryBreakdown[];
  currency?: string;
  type: "income" | "expense";
}

export default function BreakdownList({ items, currency, type }: Props) {
  const colors = type === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  if (!items.length) {
    return (
      <div className="text-center py-4 text-neo-muted text-sm">
        Belum ada data bulan ini
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.slice(0, 5).map((item, i) => (
        <div key={item.category} className="flex items-center gap-3">
          <div className={`w-8 h-8 ${colors[i % colors.length]} border-2 border-neo-border rounded-lg flex items-center justify-center text-xs font-display font-700 shrink-0`}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-display font-700 truncate">{item.category}</span>
              <span className="text-xs font-mono font-600 ml-2 shrink-0">
                {item.percent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[i % colors.length]}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-700 shrink-0">
            {formatCurrency(item.total, currency, true)}
          </span>
        </div>
      ))}
    </div>
  );
}
