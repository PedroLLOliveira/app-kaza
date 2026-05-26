import { getIncomes, createIncome, updateIncome, deleteIncome } from "@/actions/incomes";
import { getPersonalBills, createBill, toggleBillStatus, updateBill, deleteBill } from "@/actions/bills";
import { getCurrentMonthInvoices, payCreditCardInvoice } from "@/actions/creditCards";
import { getPersonalBreakdown } from "@/services/calculations";
import { getSession } from "@/actions/auth";
import { Modal } from "@/components/ui/Modal";
import { OverviewChart } from "@/components/ui/Charts";
import { PlusCircle, DollarSign, PiggyBank, Briefcase, Receipt, CheckCircle, Circle, AlertCircle, PieChart as PieChartIcon, Pencil, Trash2, CreditCard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function PersonalPage({
  searchParams,
}: {
  searchParams: Promise<{ newIncome?: string; newBill?: string; editIncome?: string; editBill?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const incomes = await getIncomes();
  const bills = await getPersonalBills();
  const currentInvoices = await getCurrentMonthInvoices();
  
  const showNewIncomeModal = resolvedSearchParams.newIncome === "true";
  const showNewBillModal = resolvedSearchParams.newBill === "true";
  
  const editIncomeId = resolvedSearchParams.editIncome;
  const incomeToEdit = editIncomeId ? incomes.find(i => i.id === editIncomeId) : null;

  const editBillId = resolvedSearchParams.editBill;
  const billToEdit = editBillId ? bills.find(b => b.id === editBillId) : null;
  
  const breakdown = session 
    ? await getPersonalBreakdown(session.userId) 
    : { salaryIncome: 0, foodVoucherIncome: 0, paidBillsSalary: 0, paidBillsFood: 0, paidInvoices: 0, salaryBalance: 0, foodVoucherBalance: 0 };

  async function handleCreateIncome(formData: FormData) {
    "use server";
    await createIncome(formData);
    redirect("/dashboard/personal");
  }

  async function handleUpdateIncome(id: string, formData: FormData) {
    "use server";
    await updateIncome(id, formData);
    redirect("/dashboard/personal");
  }

  async function handleDeleteIncome(id: string) {
    "use server";
    await deleteIncome(id);
  }

  async function handleCreateBill(formData: FormData) {
    "use server";
    await createBill(formData);
    redirect("/dashboard/personal");
  }

  async function handleUpdateBill(id: string, formData: FormData) {
    "use server";
    await updateBill(id, formData);
    redirect("/dashboard/personal");
  }

  async function handleDeleteBill(id: string) {
    "use server";
    await deleteBill(id);
  }

  async function handleToggleBill(billId: string, currentStatus: boolean) {
    "use server";
    await toggleBillStatus(billId, currentStatus, "INDIVIDUAL");
  }

  async function handleToggleInvoice(invoiceId: string, currentStatus: boolean) {
    "use server";
    await payCreditCardInvoice(invoiceId, currentStatus);
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SALARY": return <Briefcase className="w-6 h-6" />;
      case "INVESTMENT": return <PiggyBank className="w-6 h-6" />;
      case "BENEFIT": return <DollarSign className="w-6 h-6" />;
      case "FOOD_VOUCHER": return <Receipt className="w-6 h-6" />;
      default: return <DollarSign className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SALARY": return "Salário";
      case "INVESTMENT": return "Investimento";
      case "BENEFIT": return "Outro Benefício";
      case "FOOD_VOUCHER": return "Vale Alimentação";
      default: return "Outro";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Painel Pessoal
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/personal?newIncome=true"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm">Renda</span>
          </Link>
          <Link
            href="/dashboard/personal?newBill=true"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm">Despesa Pessoal</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2 relative z-10">
            Saldo na Carteira (Salário)
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
            Saldo do Vale (Alimentação)
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
            <h2 className="text-lg font-semibold">Resumo Pessoal</h2>
          </div>
          <OverviewChart 
            paidBillsSalary={breakdown.paidBillsSalary} 
            paidBillsFood={breakdown.paidBillsFood} 
            paidInvoices={breakdown.paidInvoices}
            salaryBalance={breakdown.salaryBalance}
            foodVoucherBalance={breakdown.foodVoucherBalance}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Lado das Despesas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            Minhas Contas
          </h2>
          <div className="grid gap-3">
            {bills.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                <p className="text-sm">Nenhuma conta pessoal pendente.</p>
              </div>
            ) : (
              bills.map((bill) => (
                <div key={bill.id} className={`glass-panel p-4 rounded-2xl flex items-center justify-between transition-colors relative group ${bill.isPaid ? 'opacity-60 bg-muted/20' : ''}`}>
                  
                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/personal?editBill=${bill.id}`} className="p-1.5 bg-background/80 hover:bg-background rounded-full text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3 h-3" />
                    </Link>
                    <form action={handleDeleteBill.bind(null, bill.id)}>
                      <button type="submit" className="p-1.5 bg-background/80 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center gap-4">
                    <form action={handleToggleBill.bind(null, bill.id, bill.isPaid)}>
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

        {/* Lado das Faturas de Cartão */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            Faturas (Este Mês)
          </h2>
          <div className="grid gap-3">
            {currentInvoices.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                <p className="text-sm">Nenhuma fatura de cartão para este mês.</p>
              </div>
            ) : (
              currentInvoices.map((inv) => (
                <div key={inv.id} className={`glass-panel p-4 rounded-2xl flex items-center justify-between transition-colors ${inv.isPaid ? 'opacity-60 bg-muted/20' : ''}`}>
                  <div className="flex items-center gap-4">
                    <form action={handleToggleInvoice.bind(null, inv.id, inv.isPaid)}>
                      <button type="submit" className="text-primary hover:scale-110 transition-transform focus:outline-none">
                        {inv.isPaid ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                    </form>
                    <div>
                      <h3 className={`font-medium ${inv.isPaid ? 'line-through text-muted-foreground' : ''}`}>
                        {inv.creditCard.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Vence em: {inv.dueDate.toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${inv.isPaid ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(inv.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado das Rendas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            Minhas Rendas
          </h2>
          <div className="grid gap-3">
            {incomes.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                <p className="text-sm">Nenhuma renda cadastrada.</p>
              </div>
            ) : (
              incomes.map((inc) => (
                <div key={inc.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                  {inc.isSharedPool && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-bl-lg">
                      CONJUNTA
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <Link href={`/dashboard/personal?editIncome=${inc.id}`} className="p-1.5 bg-background/80 hover:bg-background rounded-full text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3 h-3" />
                    </Link>
                    <form action={handleDeleteIncome.bind(null, inc.id)}>
                      <button type="submit" className="p-1.5 bg-background/80 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getTypeIcon(inc.type)}
                    </div>
                    <div className="pr-16">
                      <h3 className="font-medium text-sm">{inc.name}</h3>
                      <p className="text-xs text-muted-foreground">{getTypeLabel(inc.type)}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(inc.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE NOVA RENDA */}
      {showNewIncomeModal && (
        <Modal title="Nova Renda" closeHref="/dashboard/personal">
          <form action={handleCreateIncome} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Descrição da Renda</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ex: Salário da Empresa X"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Valor Mensal</label>
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
              <label htmlFor="type" className="text-sm font-medium">Tipo de Renda</label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="SALARY">Salário</option>
                <option value="FOOD_VOUCHER">Vale Alimentação / Refeição</option>
                <option value="BENEFIT">Outro Benefício</option>
                <option value="INVESTMENT">Investimento / Rendimento</option>
                <option value="OTHER">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
              <input
                type="checkbox"
                id="isSharedPool"
                name="isSharedPool"
                value="true"
                defaultChecked
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isSharedPool" className="text-sm cursor-pointer select-none">
                <span className="font-medium block">Entra para divisão das contas?</span>
                <span className="text-muted-foreground text-xs">Desmarque se for uma renda exclusiva sua.</span>
              </label>
            </div>

            <SubmitButton
              loadingText="Salvando..."
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Salvar Renda
            </SubmitButton>
          </form>
        </Modal>
      )}

      {/* MODAL DE EDITAR RENDA */}
      {incomeToEdit && (
        <Modal title="Editar Renda" closeHref="/dashboard/personal">
          <form action={handleUpdateIncome.bind(null, incomeToEdit.id)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Descrição da Renda</label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                defaultValue={incomeToEdit.name}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-amount" className="text-sm font-medium">Valor Mensal</label>
              <input
                id="edit-amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={incomeToEdit.amount}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-type" className="text-sm font-medium">Tipo de Renda</label>
              <select
                id="edit-type"
                name="type"
                required
                defaultValue={incomeToEdit.type}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="SALARY">Salário</option>
                <option value="FOOD_VOUCHER">Vale Alimentação / Refeição</option>
                <option value="BENEFIT">Outro Benefício</option>
                <option value="INVESTMENT">Investimento / Rendimento</option>
                <option value="OTHER">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
              <input
                type="checkbox"
                id="edit-isSharedPool"
                name="isSharedPool"
                value="true"
                defaultChecked={incomeToEdit.isSharedPool}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="edit-isSharedPool" className="text-sm cursor-pointer select-none">
                <span className="font-medium block">Entra para divisão das contas?</span>
                <span className="text-muted-foreground text-xs">Desmarque se for uma renda exclusiva sua.</span>
              </label>
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

      {/* MODAL DE NOVA CONTA (INDIVIDUAL) */}
      {showNewBillModal && (
        <Modal title="Nova Despesa Pessoal" closeHref="/dashboard/personal">
          <form action={handleCreateBill} className="space-y-4">
            <input type="hidden" name="scope" value="INDIVIDUAL" />
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Ex: Assinatura Spotify, Academia..."
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
              Lançar Conta Pessoal
            </SubmitButton>
          </form>
        </Modal>
      )}

      {/* MODAL DE EDITAR CONTA (INDIVIDUAL) */}
      {billToEdit && (
        <Modal title="Editar Despesa Pessoal" closeHref="/dashboard/personal">
          <form action={handleUpdateBill.bind(null, billToEdit.id)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-bill-title" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="edit-bill-title"
                name="title"
                type="text"
                required
                defaultValue={billToEdit.title}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-bill-amount" className="text-sm font-medium">Valor</label>
                <input
                  id="edit-bill-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={billToEdit.amount}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-bill-dueDate" className="text-sm font-medium">Vencimento</label>
                <input
                  id="edit-bill-dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={billToEdit.dueDate.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-bill-type" className="text-sm font-medium">Tipo</label>
              <select
                id="edit-bill-type"
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
              <label htmlFor="edit-bill-paymentSource" className="text-sm font-medium">Fonte de Pagamento</label>
              <select
                id="edit-bill-paymentSource"
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
