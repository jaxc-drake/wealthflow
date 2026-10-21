"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import type { YearlyData } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/finance";

interface Props {
  currentIncome: number;
  currentExpense: number;
  yearlyData: YearlyData[];
  currentMonth: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-3 border-neo-border rounded-xl p-3 text-xs font-display"
           style={{ boxShadow: "3px 3px 0px #1A1A1A" }}>
        <p className="font-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value, "IDR", true)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonthlyChart({ currentIncome, currentExpense, yearlyData, currentMonth }: Props) {
  // Compare this month vs last month
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastData = yearlyData[lastMonth];
  const thisData = yearlyData[currentMonth];

  const data = [
    {
      name: "Bulan Lalu",
      Pemasukan: lastData?.income || 0,
      Pengeluaran: lastData?.expense || 0,
    },
    {
      name: "Bulan Ini",
      Pemasukan: thisData?.income || currentIncome,
      Pengeluaran: thisData?.expense || currentExpense,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fontFamily: "Space Grotesk", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Pemasukan" fill="#B8FF4F" radius={[6, 6, 0, 0]}
             stroke="#1A1A1A" strokeWidth={2} />
        <Bar dataKey="Pengeluaran" fill="#FF6B9D" radius={[6, 6, 0, 0]}
             stroke="#1A1A1A" strokeWidth={2} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 11, fontFamily: "Space Grotesk", fontWeight: 600 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
