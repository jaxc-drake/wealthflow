import { Target } from "lucide-react";
import { formatCurrency } from "@/utils/finance";
import type { FinancialStatus } from "@/lib/supabase/types";

interface BudgetBarProps {
  budget: number;
  expense: number;
  percent: number;
  remaining: number;
  currency?: string;
  status: FinancialStatus;
}

const BAR_COLORS: Record<FinancialStatus, string> = {
  healthy: "bg-brand-lime",
  warning: "bg-brand-orange",
  over_budget: "bg-brand-red",
  loss: "bg-brand-pink",
};

export default function BudgetBar({
  budget,
  expense,
  percent,
  remaining,
  currency,
  status,
}: BudgetBarProps) {
  const clampedPercent = Math.min(percent, 100);
  const barColor = BAR_COLORS[status];

  return (
    <div className="y2k-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-wordmark text-base uppercase leading-none tracking-[-0.03em]">
          <Target size={17} strokeWidth={2.7} />
          Budget Bulan Ini
        </h3>
        <span className="rounded-full border-2 border-y2k-ink bg-white px-2 py-0.5 font-mono text-[11px] font-800">
          {percent.toFixed(0)}%
        </span>
      </div>

      <div className="mb-3 h-6 w-full overflow-hidden rounded-lg border-2 border-y2k-ink bg-y2k-lilac">
        <div
          className={`pixel-meter h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 font-display text-[10px] font-700 uppercase tracking-wide">
        <div>
          <span className="text-y2k-muted">Terpakai </span>
          <span className="font-mono">{formatCurrency(expense, currency, true)}</span>
        </div>
        <div className="text-right">
          <span className="text-y2k-muted">Limit </span>
          <span className="font-mono">{formatCurrency(budget, currency, true)}</span>
        </div>
      </div>

      {status === "over_budget" ? (
        <div className="mt-2 rounded-lg border-2 border-y2k-ink bg-brand-red px-3 py-1.5 text-center">
          <span className="font-display text-[10px] font-800 uppercase tracking-wide text-white">
            Over budget {formatCurrency(expense - budget, currency, true)}
          </span>
        </div>
      ) : (
        <div className="mt-2 rounded-lg border-2 border-y2k-ink bg-y2k-lavender px-3 py-1.5 text-center">
          <span className="font-display text-[10px] font-600 uppercase tracking-wide text-y2k-muted">
            Sisa budget{" "}
            <strong className="font-mono text-y2k-ink">
              {formatCurrency(remaining, currency, true)}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
