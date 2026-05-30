"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

export function MonthlyBarChart({ data }: { data: { id: string, label: string, value: number }[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground border-dashed border-2 border-border rounded-xl">
        Nenhuma despesa futura programada.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border-border text-sm rounded-xl bg-card border">
          <p className="font-medium text-foreground">{payload[0].payload.label}</p>
          <p className="font-bold text-primary">
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
        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            hide
          />
          <Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)", radius: 8 }} content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))" 
            radius={[6, 6, 6, 6]}
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

