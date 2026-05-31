"use client";

import { useState } from "react";
import { PlusCircle, Target, TrendingUp, Trophy, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { SubmitButton } from "./SubmitButton";
import { createReserve, updateReserveAmount, deleteReserve } from "@/actions/reserves";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export function GoalsList({ goals, scope }: { goals: Goal[], scope: "HOUSEHOLD" | "INDIVIDUAL" }) {
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleCreate = async (formData: FormData) => {
    await createReserve(formData);
    setShowNewGoalModal(false);
  };

  const handleUpdateAmount = async (formData: FormData) => {
    if (!editingGoal) return;
    const addAmount = parseFloat(formData.get("addAmount") as string);
    if (!isNaN(addAmount)) {
      await updateReserveAmount(editingGoal.id, editingGoal.currentAmount + addAmount);
    }
    setEditingGoal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-muted-foreground" />
          Nossas Metas (Caixinhas)
        </h2>
        <button
          onClick={() => setShowNewGoalModal(true)}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="md:col-span-2 p-6 border-2 border-dashed border-border rounded-2xl text-center text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Nenhuma meta definida. Que tal começar a poupar para uma viagem?</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goal.currentAmount)} / 
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingGoal(goal)}
                      className="p-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                      title="Adicionar Dinheiro"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <form action={deleteReserve.bind(null, goal.id)}>
                      <button 
                        type="submit"
                        className="p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-white transition-colors"
                        title="Excluir Meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative z-10">
                  <div 
                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-primary to-accent'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="mt-2 text-right text-xs font-bold text-muted-foreground">
                  {progress.toFixed(1)}% {isCompleted && "🎉"}
                </div>

                {isCompleted && (
                  <div className="absolute top-[-20px] right-[-20px] opacity-10">
                    <Trophy className="w-32 h-32 text-green-500" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showNewGoalModal && (
        <Modal title="Nova Meta Financeira" onClose={() => setShowNewGoalModal(false)}>
          <form action={handleCreate} className="space-y-4">
            <input type="hidden" name="scope" value={scope} />
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">O que você quer conquistar?</label>
              <input
                id="name" name="name" type="text" required placeholder="Ex: Viagem para Europa"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="targetAmount" className="text-sm font-medium">Valor Total Necessário</label>
              <input
                id="targetAmount" name="targetAmount" type="number" step="0.01" required placeholder="Ex: 5000.00"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currentAmount" className="text-sm font-medium">Valor Inicial Guardado (Opcional)</label>
              <input
                id="currentAmount" name="currentAmount" type="number" step="0.01" defaultValue="0"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none"
              />
            </div>
            <SubmitButton loadingText="Criando..." className="w-full py-3 bg-primary text-primary-foreground rounded-xl">
              Criar Meta
            </SubmitButton>
          </form>
        </Modal>
      )}

      {editingGoal && (
        <Modal title={`Guardar dinheiro: ${editingGoal.name}`} onClose={() => setEditingGoal(null)}>
          <form action={handleUpdateAmount} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="addAmount" className="text-sm font-medium">Quanto deseja adicionar na meta?</label>
              <input
                id="addAmount" name="addAmount" type="number" step="0.01" required placeholder="Ex: 150.00"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none"
              />
            </div>
            <SubmitButton loadingText="Adicionando..." className="w-full py-3 bg-primary text-primary-foreground rounded-xl">
              Adicionar Valor
            </SubmitButton>
          </form>
        </Modal>
      )}
    </div>
  );
}
