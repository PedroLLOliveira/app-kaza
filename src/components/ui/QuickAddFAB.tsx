"use client";

import { useState, useEffect } from "react";
import { Plus, Zap } from "lucide-react";
import { createBill } from "@/actions/bills";
import { getCreditCards } from "@/actions/creditCards";
import { SubmitButton } from "./SubmitButton";

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentSource, setPaymentSource] = useState("SALARY");
  const [creditCards, setCreditCards] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCreditCards().then(setCreditCards);
    }
  }, [isOpen]);

  const handleAction = async (formData: FormData) => {
    await createBill(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 focus:outline-none"
        title="Lançamento Rápido"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden relative">
            <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Lançamento Expresso
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form action={handleAction} className="p-4 space-y-4">
              <input type="hidden" name="type" value="VARIABLE" />
              <input type="hidden" name="dueDate" value={new Date().toISOString().split('T')[0]} />
              <input type="hidden" name="isPaid" value="true" /> {/* Lançamento expresso já entra pago por padrão */}

              <div className="space-y-1">
                <input
                  name="title" type="text" required placeholder="O quê? (Ex: Padaria)" autoFocus
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    name="amount" type="number" step="0.01" required placeholder="R$ 0,00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <select name="scope" className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm" required>
                    <option value="INDIVIDUAL">Pessoal</option>
                    <option value="HOUSEHOLD">Casa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <select 
                    name="category" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm"
                    required
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
                <div className="flex-1 space-y-1">
                  <select 
                    name="paymentSource" 
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm"
                    required
                  >
                    <option value="SALARY">Carteira/Pix</option>
                    <option value="CREDIT_CARD">Cartão</option>
                  </select>
                </div>
              </div>

              {paymentSource === "CREDIT_CARD" && (
                <div className="space-y-1">
                  <select name="creditCardId" className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none text-sm" required>
                    <option value="">Qual cartão?</option>
                    {creditCards.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <SubmitButton loadingText="Lançando..." className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
                Lançar
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
