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
      <div className="bg-white border-3 border-neo-border rounded-xl p-3 text-xs font-display"
           style={{ boxShadow: "3px 3px 0px #1A1A1A" }}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fontFamily: "Space Grotesk", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#1A1A1A" strokeDasharray="4 4" strokeWidth={1} />
        <Line
          type="monotone"
          dataKey="income"
          name="Pemasukan"
          stroke="#B8FF4F"
          strokeWidth={3}
          dot={{ fill: "#B8FF4F", stroke: "#1A1A1A", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#1A1A1A", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Pengeluaran"
          stroke="#FF6B9D"
          strokeWidth={3}
          dot={{ fill: "#FF6B9D", stroke: "#1A1A1A", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#1A1A1A", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="#4ECBFF"
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
