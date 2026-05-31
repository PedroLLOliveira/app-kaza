"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";

interface BillFormProps {
  initialData?: {
    id: string;
    title: string;
    amount: number;
    type: string;
    dueDate: Date;
    paymentSource: string;
    creditCardId?: string | null;
    category?: string;
  };
  creditCards: { id: string; name: string }[];
  actionLabel: string;
  loadingLabel: string;
}

export function BillForm({ initialData, creditCards, actionLabel, loadingLabel }: BillFormProps) {
  const [paymentSource, setPaymentSource] = useState(initialData?.paymentSource || "SALARY");
  const [creditCardId, setCreditCardId] = useState(initialData?.creditCardId || "");
  const [invoiceMonth, setInvoiceMonth] = useState("");

  const isCreditCard = paymentSource === "CREDIT_CARD";

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Nome da Conta</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title}
          placeholder="Ex: Conta de Luz, iFood..."
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
            placeholder="0.00"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">Vencimento (Data do Gasto)</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : ""}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Frequência</label>
          <select
            id="type"
            name="type"
            required
            defaultValue={initialData?.type || "FIXED"}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
          >
            <option value="FIXED">Fixa (Mensal)</option>
            <option value="EMERGENCY">Emergencial / Avulsa</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">Categoria</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || "OUTROS"}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
          >
            <option value="ALIMENTACAO">Alimentação</option>
            <option value="TRANSPORTE">Transporte</option>
            <option value="MORADIA">Moradia</option>
            <option value="LAZER">Lazer</option>
            <option value="SAUDE">Saúde</option>
            <option value="EDUCACAO">Educação</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="paymentSource" className="text-sm font-medium">Fonte de Pagamento</label>
        <select
          id="paymentSource"
          name="paymentSource"
          required
          value={paymentSource}
          onChange={(e) => setPaymentSource(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
        >
          <option value="SALARY">Carteira / Salário Livre</option>
          <option value="FOOD_VOUCHER">Vale Alimentação</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
        </select>
      </div>

      {isCreditCard && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <label htmlFor="creditCardId" className="text-sm font-medium text-primary">Cartão</label>
            <select
              id="creditCardId"
              name="creditCardId"
              required={isCreditCard}
              value={creditCardId}
              onChange={(e) => setCreditCardId(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              <option value="" disabled>Selecione um cartão</option>
              {creditCards.map(card => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="invoiceMonth" className="text-sm font-medium text-primary">Fatura (Mês/Ano)</label>
            <input
              id="invoiceMonth"
              name="invoiceMonth"
              type="month"
              value={invoiceMonth}
              onChange={(e) => setInvoiceMonth(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Opcional. Se vazio, entra no mês atual.
            </p>
          </div>
        </div>
      )}

      {/* Hidden input to pass scope implicitly as we only use this in Personal Dashboard for now, or it can be a hidden prop */}
      <input type="hidden" name="scope" value="INDIVIDUAL" />

      <SubmitButton
        loadingText={loadingLabel}
        className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
      >
        {actionLabel}
      </SubmitButton>
    </>
  );
}
