import type { YearlyData } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/finance";

interface Props {
  data: YearlyData[];
  currency?: string;
}

const SERIES = [
  { key: "income" as const, label: "Pemasukan", color: "bg-brand-purple" },
  { key: "expense" as const, label: "Pengeluaran", color: "bg-brand-lime" },
  { key: "balance" as const, label: "Saldo", color: "bg-y2k-ink" },
];

function compact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}rb`;
  return `${Math.round(value)}`;
}

function niceCeil(value: number) {
  if (value <= 0) return 1_000_000;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

export default function PixelTrendChart({ data, currency }: Props) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => [d.income, d.expense, Math.abs(d.balance)])
  );
  const chartMax = niceCeil(maxValue);
  const gridValues = [chartMax, (chartMax * 2) / 3, chartMax / 3, 0];

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-3">
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="flex items-center gap-1 text-[9px] font-display font-700"
          >
            <span className={`h-2.5 w-2.5 rounded-[2px] ${series.color}`} />
            {series.label}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex h-[132px] w-8 shrink-0 flex-col justify-between text-right font-mono text-[8px] font-700 text-y2k-muted">
          {gridValues.map((value, i) => (
            <span key={i} className="-translate-y-1">
              {compact(value)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-[132px] border-b-2 border-y2k-ink">
            <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full border-t border-dashed border-y2k-ink/20" />
              ))}
            </div>

            <div className="relative flex h-full items-end justify-around gap-1 px-1">
              {data.map((point) => (
                <div key={point.month} className="flex flex-col items-center gap-1">
                  <div className="flex h-[124px] items-end justify-center gap-[3px]">
                    {SERIES.map((series) => {
                      const raw = series.key === "balance"
                        ? Math.abs(point.balance)
                        : point[series.key];
                      const height = raw <= 0
                        ? 0
                        : Math.max(3, (raw / chartMax) * 100);

                      return (
                        <div
                          key={series.key}
                          className="flex h-full w-3 items-end sm:w-4"
                          title={`${series.label}: ${formatCurrency(raw, currency)}`}
                        >
                          <span
                            className={`w-full rounded-t-[4px] ${series.color}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="font-mono text-[8px] font-700 uppercase text-y2k-muted">
                    {point.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
