"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OverviewChartProps {
  paidBillsSalary: number;
  paidBillsFood: number;
  paidInvoices?: number;
  salaryBalance: number;
  foodVoucherBalance: number;
}

export function OverviewChart({ 
  paidBillsSalary, 
  paidBillsFood, 
  paidInvoices = 0, 
  salaryBalance, 
  foodVoucherBalance 
}: OverviewChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: "Contas Pagas (Salário)", value: paidBillsSalary, color: "#ef4444" },
    { name: "Contas Pagas (VR)", value: paidBillsFood, color: "#f97316" },
    { name: "Faturas Pagas", value: paidInvoices, color: "#8b5cf6" },
    { name: "Saldo na Carteira", value: salaryBalance > 0 ? salaryBalance : 0, color: "#3b82f6" },
    { name: "Saldo no VR", value: foodVoucherBalance > 0 ? foodVoucherBalance : 0, color: "#22c55e" },
  ].filter(item => item.value > 0);

  if (!mounted) {
    return <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground border-dashed border-2 border-border rounded-xl">
        Sem dados financeiros para exibir.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border-border text-sm rounded-xl bg-card border">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="font-bold" style={{ color: payload[0].payload.color }}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
