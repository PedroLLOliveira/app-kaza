"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryData {
  name: string;
  value: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  ALIMENTACAO: "#ff7c43",
  TRANSPORTE: "#f95d6a",
  MORADIA: "#2f4b7c",
  LAZER: "#a05195",
  SAUDE: "#d45087",
  EDUCACAO: "#665191",
  OUTROS: "#8e9196"
};

const CATEGORY_LABELS: Record<string, string> = {
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  MORADIA: "Moradia",
  LAZER: "Lazer",
  SAUDE: "Saúde",
  EDUCACAO: "Educação",
  OUTROS: "Outros"
};

export function CategoryChart({ data }: { data: { category: string; amount: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">
        Nenhum dado de categoria disponível.
      </div>
    );
  }

  // Format data for Recharts
  const chartData: CategoryData[] = data.map(d => ({
    name: CATEGORY_LABELS[d.category] || d.category,
    value: d.amount,
    originalCategory: d.category
  }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry: any, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.originalCategory] || CATEGORY_COLORS.OUTROS} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => 
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
            }
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
