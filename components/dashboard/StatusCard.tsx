import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/utils/finance";

interface StatusCardProps {
  label: string;
  value: number;
  currency?: string;
  tone: "lime" | "purple";
}

export default function StatusCard({ label, value, currency, tone }: StatusCardProps) {
  const isLime = tone === "lime";
  const Icon = isLime ? ArrowUpRight : ArrowDownLeft;

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border-3 border-y2k-ink p-3.5 shadow-hard ${
        isLime ? "bg-brand-lime text-y2k-ink" : "bg-brand-purple text-white"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute -right-5 -top-6 h-16 w-16 rounded-full border-2 ${
          isLime ? "border-y2k-ink/15 bg-white/20" : "border-white/20 bg-white/10"
        }`}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-y2k-ink ${
            isLime ? "bg-white/45" : "bg-white/15"
          }`}
        >
          <Icon size={26} strokeWidth={3} />
        </span>
        <span className="pt-0.5 text-right text-[9px] font-display font-800 uppercase leading-tight tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="relative mt-3 whitespace-nowrap font-mono text-[clamp(0.78rem,4vw,1.05rem)] font-800 leading-none tracking-[-0.04em]">
        {isLime ? "+" : "−"}
        {formatCurrency(value, currency)}
      </p>
    </div>
  );
}
