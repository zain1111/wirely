"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SalesChart({
  data,
}: {
  data: { day: string; orders: number; revenue: number }[];
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted">
        Connect Supabase to see the last 30 days of sales.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e0e6" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} hide />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0d9488"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
