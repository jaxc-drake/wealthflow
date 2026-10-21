import { formatCurrency } from "@/utils/finance";

interface StatusCardProps {
  label: string;
  value: number;
  currency?: string;
  emoji: string;
  color: string;
}

export default function StatusCard({ label, value, currency, emoji, color }: StatusCardProps) {
  return (
    <div
      className={`${color} border-3 border-neo-border rounded-xl p-3`}
      style={{ boxShadow: "4px 4px 0px #1A1A1A" }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base">{emoji}</span>
        <span className="text-xs font-display font-600 text-neo-text opacity-80">{label}</span>
      </div>
      <p className="font-mono font-700 text-base leading-tight text-neo-text">
        {formatCurrency(value, currency, true)}
      </p>
      <p className="text-xs text-neo-text opacity-60 mt-0.5 font-mono">
        {formatCurrency(value, currency)}
      </p>
    </div>
  );
}
