// components/charts/ueq-chart.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UEQChartProps {
  data: {
    category: string;
    average: number;
  }[];
}

export default function UEQChart({ data }: UEQChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="average" fill="#8884d8" name="Rata-rata UEQ" />
      </BarChart>
    </ResponsiveContainer>
  );
}