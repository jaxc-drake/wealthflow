"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from "recharts";
import type { YearlyData } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/finance";

interface Props {
  data: YearlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border-2 border-y2k-ink bg-white p-3 font-display text-xs shadow-hard-sm">
        <p className="font-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-600">
            {p.name}: {formatCurrency(p.value, "IDR", true)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function YearlyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D9D1FF" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fontFamily: "Space Grotesk", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#0A0A0A" strokeDasharray="4 4" strokeWidth={1} />
        <Line
          type="monotone"
          dataKey="income"
          name="Pemasukan"
          stroke="#D6FF3F"
          strokeWidth={3}
          dot={{ fill: "#D6FF3F", stroke: "#0A0A0A", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#0A0A0A", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Pengeluaran"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: "#8B5CF6", stroke: "#0A0A0A", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#0A0A0A", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="#0A0A0A"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontFamily: "Space Grotesk", fontWeight: 600, paddingTop: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
