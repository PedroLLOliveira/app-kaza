import { calculateHouseBalance, calculateHouseIncome } from "@/services/calculations";
import { getHouseholdBills, createBill, toggleBillStatus, updateBill, deleteBill } from "@/actions/bills";
import { getSession } from "@/actions/auth";
import { Home, TrendingUp, AlertCircle, PlusCircle, Receipt, CheckCircle, Circle, PieChart as PieChartIcon, Pencil, Trash2, PiggyBank } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { OverviewChart } from "@/components/ui/Charts";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function HousePage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; edit?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const breakdown = session 
    ? await calculateHouseBalance(session.householdId) 
    : { salaryIncome: 0, foodVoucherIncome: 0, salaryBalance: 0, foodVoucherBalance: 0, paidBillsSalary: 0, paidBillsFood: 0 };
  const bills = await getHouseholdBills();
  
  const showNewModal = resolvedSearchParams.new === "true";
  const editId = resolvedSearchParams.edit;
  const billToEdit = editId ? bills.find(b => b.id === editId) : null;

  async function handleCreate(formData: FormData) {
    "use server";
    await createBill(formData);
    redirect("/dashboard/house");
  }

  async function handleUpdate(id: string, formData: FormData) {
    "use server";
    await updateBill(id, formData);
    redirect("/dashboard/house");
  }

  async function handleDelete(id: string) {
    "use server";
    await deleteBill(id);
  }

  async function handleToggle(billId: string, currentStatus: boolean) {
    "use server";
    await toggleBillStatus(billId, currentStatus, "HOUSEHOLD");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Painel da Casa
          </h1>
        </div>
        <Link
          href="/dashboard/house?new=true"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Nova Despesa</span>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2 relative z-10">
            Saldo Restante (Dinheiro)
          </p>
          <p className="text-3xl font-black text-foreground relative z-10">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(breakdown.salaryBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-4 relative z-10 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Receita ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(breakdown.salaryIncome)}) - Despesas Pagas.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-24 h-24 text-accent" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2 relative z-10">
            Saldo Restante (Vale)
          </p>
          <p className="text-3xl font-black text-foreground relative z-10">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(breakdown.foodVoucherBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-4 relative z-10 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Receita ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(breakdown.foodVoucherIncome)}) - Despesas Pagas.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Resumo Financeiro</h2>
          </div>
          <OverviewChart 
            paidBillsSalary={breakdown.paidBillsSalary} 
            paidBillsFood={breakdown.paidBillsFood} 
            salaryBalance={breakdown.salaryBalance}
            foodVoucherBalance={breakdown.foodVoucherBalance}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Contas da Casa</h2>
        <div className="grid gap-3">
          {bills.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conta pendente para a casa!</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className={`glass-panel p-4 rounded-2xl flex items-center justify-between transition-colors relative group ${bill.isPaid ? 'opacity-60 bg-muted/20' : ''}`}>
                
                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/house?edit=${bill.id}`} className="p-1.5 bg-background/80 hover:bg-background rounded-full text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-3 h-3" />
                  </Link>
                  <form action={handleDelete.bind(null, bill.id)}>
                    <button type="submit" className="p-1.5 bg-background/80 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-4">
                  <form action={handleToggle.bind(null, bill.id, bill.isPaid)}>
                    <button type="submit" className="text-primary hover:scale-110 transition-transform focus:outline-none">
                      {bill.isPaid ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                  </form>
                  <div className="pr-12">
                    <h3 className={`font-medium ${bill.isPaid ? 'line-through text-muted-foreground' : ''}`}>
                      {bill.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">Vence em: {bill.dueDate.toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <p className={`font-bold ${bill.isPaid ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(bill.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewModal && (
        <Modal title="Nova Despesa da Casa" closeHref="/dashboard/house">
          <form action={handleCreate} className="space-y-4">
            <input type="hidden" name="scope" value="HOUSEHOLD" />
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Ex: Conta de Luz, Aluguel..."
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
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">Vencimento</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Tipo</label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="FIXED">Fixa (Mensal)</option>
                <option value="EMERGENCY">Emergencial / Avulsa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentSource" className="text-sm font-medium">Fonte de Pagamento</label>
              <select
                id="paymentSource"
                name="paymentSource"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="SALARY">Carteira / Salário</option>
                <option value="FOOD_VOUCHER">Vale Alimentação</option>
              </select>
            </div>

            <SubmitButton
              loadingText="Lançando..."
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Lançar Conta
            </SubmitButton>
          </form>
        </Modal>
      )}

      {billToEdit && (
        <Modal title="Editar Despesa da Casa" closeHref="/dashboard/house">
          <form action={handleUpdate.bind(null, billToEdit.id)} className="space-y-4">
            
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="edit-title"
                name="title"
                type="text"
                required
                defaultValue={billToEdit.title}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-amount" className="text-sm font-medium">Valor</label>
                <input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={billToEdit.amount}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-dueDate" className="text-sm font-medium">Vencimento</label>
                <input
                  id="edit-dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={billToEdit.dueDate.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-type" className="text-sm font-medium">Tipo</label>
              <select
                id="edit-type"
                name="type"
                required
                defaultValue={billToEdit.type}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="FIXED">Fixa (Mensal)</option>
                <option value="EMERGENCY">Emergencial / Avulsa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-paymentSource" className="text-sm font-medium">Fonte de Pagamento</label>
              <select
                id="edit-paymentSource"
                name="paymentSource"
                required
                defaultValue={(billToEdit as any).paymentSource || "SALARY"}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="SALARY">Carteira / Salário</option>
                <option value="FOOD_VOUCHER">Vale Alimentação</option>
              </select>
            </div>

            <SubmitButton
              loadingText="Salvando..."
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Salvar Alterações
            </SubmitButton>
          </form>
        </Modal>
      )}
    </div>
  );
}
