"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";

interface IncomeFormProps {
  initialData?: {
    id: string;
    name: string;
    amount: number;
    type: string;
    isSharedPool: boolean;
    debtorName?: string | null;
    destination?: string | null;
  };
  actionLabel: string;
  loadingLabel: string;
}

export function IncomeForm({ initialData, actionLabel, loadingLabel }: IncomeFormProps) {
  const [type, setType] = useState(initialData?.type || "SALARY");

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Nome da Renda</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          placeholder="Ex: Salário, Vale Refeição, Joãozinho (Agiota)..."
          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">Valor</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            defaultValue={initialData?.amount}
            placeholder="R$ 0,00"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Tipo</label>
          <select
            id="type"
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
          >
            <option value="SALARY">Salário</option>
            <option value="BENEFIT">Benefício Corporativo</option>
            <option value="FOOD_VOUCHER">Vale Alimentação</option>
            <option value="LOAN">Agiota (Empréstimo)</option>
            <option value="OTHER">Outros</option>
          </select>
        </div>
      </div>

      {type === "LOAN" && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <label htmlFor="debtorName" className="text-sm font-medium text-primary">Nome do Devedor</label>
            <input
              id="debtorName"
              name="debtorName"
              type="text"
              required
              defaultValue={initialData?.debtorName || ""}
              placeholder="Quem pegou emprestado?"
              className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="destination" className="text-sm font-medium text-primary">Destino</label>
            <select
              id="destination"
              name="destination"
              required
              defaultValue={initialData?.destination || "CREDIT_CARD"}
              className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="CREDIT_CARD">Pagar Cartão (Faturas)</option>
              <option value="CASH">Apenas Dinheiro (Livre)</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="isSharedPool"
          name="isSharedPool"
          value="true"
          defaultChecked={initialData?.isSharedPool ?? true}
          className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
        />
        <label htmlFor="isSharedPool" className="text-sm text-muted-foreground cursor-pointer">
          Compartilhar com a Casa (Somar na renda conjunta)
        </label>
      </div>

      <SubmitButton
        loadingText={loadingLabel}
        className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
      >
        {actionLabel}
      </SubmitButton>
    </>
  );
}
