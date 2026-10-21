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
  healthy: "bg-brand-green",
  warning: "bg-brand-yellow",
  over_budget: "bg-brand-red",
  loss: "bg-brand-pink",
};

export default function BudgetBar({ budget, expense, percent, remaining, currency, status }: BudgetBarProps) {
  const clampedPercent = Math.min(percent, 100);
  const barColor = BAR_COLORS[status];

  return (
    <div className="neo-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-700 text-sm">🎯 Budget Bulan Ini</h3>
        <span className="font-mono font-700 text-sm">
          {percent.toFixed(0)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-5 bg-gray-100 border-3 border-neo-border rounded-lg overflow-hidden mb-3">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-display">
        <div>
          <span className="text-neo-muted">Terpakai: </span>
          <span className="font-700">{formatCurrency(expense, currency, true)}</span>
        </div>
        <div className="text-right">
          <span className="text-neo-muted">Limit: </span>
          <span className="font-700">{formatCurrency(budget, currency, true)}</span>
        </div>
      </div>

      {status === "over_budget" ? (
        <div className="mt-2 bg-brand-red border-2 border-neo-border rounded-lg px-3 py-1.5 text-center">
          <span className="text-xs font-display font-700 text-white">
            🚨 Over Budget {formatCurrency(expense - budget, currency, true)}!
          </span>
        </div>
      ) : (
        <div className="mt-2 bg-neo-bg border-2 border-neo-border rounded-lg px-3 py-1.5 text-center">
          <span className="text-xs font-display font-600 text-neo-muted">
            Sisa budget: <strong className="text-neo-text">{formatCurrency(remaining, currency, true)}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
