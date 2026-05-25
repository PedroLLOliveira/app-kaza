import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from "@/actions/accounts";
import { getCreditCards, createCreditCardWithInvoices, payCreditCardInvoice, deleteCreditCard, createSingleCreditCardInvoice, updateCreditCardInvoice, deleteCreditCardInvoice } from "@/actions/creditCards";
import { Modal } from "@/components/ui/Modal";
import { PlusCircle, Wallet, Pencil, Trash2, CreditCard as CreditCardIcon, CheckCircle, Circle, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; edit?: string; newCard?: string; addInvoice?: string; editInvoice?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const accounts = await getBankAccounts();
  const creditCards = await getCreditCards();
  
  const showNewModal = resolvedSearchParams.new === "true";
  const showNewCardModal = resolvedSearchParams.newCard === "true";
  
  const editId = resolvedSearchParams.edit;
  const accountToEdit = editId ? accounts.find(a => a.id === editId) : null;

  const addInvoiceCardId = resolvedSearchParams.addInvoice;
  const cardToAddInvoice = addInvoiceCardId ? creditCards.find(c => c.id === addInvoiceCardId) : null;

  const editInvoiceId = resolvedSearchParams.editInvoice;
  // Encontrar a fatura específica varrendo todos os cartões
  let invoiceToEdit = null;
  for (const card of creditCards) {
    const inv = card.invoices.find(i => i.id === editInvoiceId);
    if (inv) {
      invoiceToEdit = inv;
      break;
    }
  }

  async function handleCreate(formData: FormData) {
    "use server";
    await createBankAccount(formData);
    redirect("/dashboard/accounts");
  }

  async function handleUpdate(id: string, formData: FormData) {
    "use server";
    await updateBankAccount(id, formData);
    redirect("/dashboard/accounts");
  }

  async function handleDelete(id: string) {
    "use server";
    await deleteBankAccount(id);
  }

  async function handleCreateCard(formData: FormData) {
    "use server";
    await createCreditCardWithInvoices(formData);
    redirect("/dashboard/accounts");
  }

  async function handleDeleteCard(id: string) {
    "use server";
    await deleteCreditCard(id);
  }

  async function handlePayInvoice(invoiceId: string, currentStatus: boolean) {
    "use server";
    await payCreditCardInvoice(invoiceId, currentStatus);
  }

  async function handleAddSingleInvoice(cardId: string, formData: FormData) {
    "use server";
    await createSingleCreditCardInvoice(cardId, formData);
    redirect("/dashboard/accounts");
  }

  async function handleUpdateInvoice(invoiceId: string, formData: FormData) {
    "use server";
    await updateCreditCardInvoice(invoiceId, formData);
    redirect("/dashboard/accounts");
  }

  async function handleDeleteInvoice(invoiceId: string) {
    "use server";
    await deleteCreditCardInvoice(invoiceId);
  }

  return (
    <div className="space-y-12">
      
      {/* SEÇÃO: CONTAS BANCÁRIAS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Contas Bancárias
          </h1>
          <Link
            href="/dashboard/accounts?new=true"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Conta</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conta bancária cadastrada.</p>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="glass-panel p-6 rounded-2xl relative group hover:-translate-y-1 transition-transform cursor-default">
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/accounts?edit=${acc.id}`} className="p-2 bg-background/80 hover:bg-background rounded-full text-muted-foreground hover:text-primary transition-colors backdrop-blur-sm">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form action={handleDelete.bind(null, acc.id)}>
                    <button type="submit" className="p-2 bg-background/80 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors backdrop-blur-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-accent/10 text-accent">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium pr-16">{acc.name}</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(acc.balance)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SEÇÃO: CARTÕES DE CRÉDITO */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <CreditCardIcon className="w-7 h-7 text-primary" />
            Cartões de Crédito
          </h2>
          <Link
            href="/dashboard/accounts?newCard=true"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Cartão</span>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {creditCards.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cartão cadastrado.</p>
            </div>
          ) : (
            creditCards.map((card) => (
              <div key={card.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col">
                {/* Header do Cartão */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <form action={handleDeleteCard.bind(null, card.id)}>
                      <button type="submit" className="p-2 bg-background/80 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors backdrop-blur-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Limite: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(card.limit)}
                  </p>
                </div>

                {/* Lista de Faturas */}
                <div className="p-6 bg-background/50 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Faturas</h4>
                    <Link href={`/dashboard/accounts?addInvoice=${card.id}`} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                      <Plus className="w-3 h-3" /> Adicionar
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {card.invoices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem faturas lançadas.</p>
                    ) : (
                      card.invoices.map((invoice) => (
                        <div key={invoice.id} className={`flex items-center justify-between p-3 rounded-xl border border-border/50 transition-colors relative group ${invoice.isPaid ? 'bg-muted/30 opacity-70' : 'bg-background hover:border-primary/50'}`}>
                          
                          {/* Botões de Ação na Fatura (Hover) */}
                          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-border">
                            <Link href={`/dashboard/accounts?editInvoice=${invoice.id}`} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors">
                              <Pencil className="w-3 h-3" />
                            </Link>
                            <form action={handleDeleteInvoice.bind(null, invoice.id)}>
                              <button type="submit" className="p-1.5 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </form>
                          </div>

                          <div className="flex items-center gap-3">
                            <form action={handlePayInvoice.bind(null, invoice.id, invoice.isPaid)}>
                              <button type="submit" className="text-primary hover:scale-110 transition-transform focus:outline-none">
                                {invoice.isPaid ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                            </form>
                            <div>
                              <p className={`font-medium text-sm ${invoice.isPaid ? 'line-through text-muted-foreground' : ''}`}>
                                Venc. {invoice.dueDate.toLocaleDateString("pt-BR")}
                              </p>
                              {invoice.isPaid && <span className="text-[10px] text-primary font-bold">PAGO</span>}
                            </div>
                          </div>
                          <p className={`font-bold pr-16 ${invoice.isPaid ? 'text-muted-foreground' : ''}`}>
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(invoice.amount)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MODAL BANCÁRIO */}
      {showNewModal && (
        <Modal title="Nova Conta Bancária" closeHref="/dashboard/accounts">
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ex: Nubank, Itaú..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">Saldo Atual</label>
              <input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Adicionar Conta
            </button>
          </form>
        </Modal>
      )}

      {accountToEdit && (
        <Modal title="Editar Conta Bancária" closeHref="/dashboard/accounts">
          <form action={handleUpdate.bind(null, accountToEdit.id)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Nome da Conta</label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                defaultValue={accountToEdit.name}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-balance" className="text-sm font-medium">Saldo Atual</label>
              <input
                id="edit-balance"
                name="balance"
                type="number"
                step="0.01"
                required
                defaultValue={accountToEdit.balance}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Salvar Alterações
            </button>
          </form>
        </Modal>
      )}

      {/* MODAL DE CARTÃO DE CRÉDITO */}
      {showNewCardModal && (
        <Modal title="Novo Cartão de Crédito" closeHref="/dashboard/accounts">
          <form action={handleCreateCard} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="card-name" className="text-sm font-medium">Nome do Cartão</label>
              <input
                id="card-name"
                name="name"
                type="text"
                required
                placeholder="Ex: Cartão XP, Nubank..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="card-limit" className="text-sm font-medium">Limite</label>
                <input
                  id="card-limit"
                  name="limit"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="card-dueDay" className="text-sm font-medium">Dia do Vencimento</label>
                <input
                  id="card-dueDay"
                  name="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="Dia 10"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <label htmlFor="card-baseAmount" className="text-sm font-medium text-primary">Valor da Fatura</label>
                <input
                  id="card-baseAmount"
                  name="baseAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={0}
                  className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="card-invoiceCount" className="text-sm font-medium">Qtd. Meses (Faturas)</label>
                <input
                  id="card-invoiceCount"
                  name="invoiceCount"
                  type="number"
                  min="1"
                  max="48"
                  required
                  defaultValue={1}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              O Kaza gerará N faturas futuras no valor inserido. Você poderá editar o valor de cada fatura posteriormente.
            </p>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Criar Cartão e Faturas
            </button>
          </form>
        </Modal>
      )}

      {/* MODAL PARA ADICIONAR 1 FATURA */}
      {cardToAddInvoice && (
        <Modal title={`Nova Fatura: ${cardToAddInvoice.name}`} closeHref="/dashboard/accounts">
          <form action={handleAddSingleInvoice.bind(null, cardToAddInvoice.id)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="inv-amount" className="text-sm font-medium">Valor da Fatura</label>
                <input
                  id="inv-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="inv-dueDate" className="text-sm font-medium">Vencimento</label>
                <input
                  id="inv-dueDate"
                  name="dueDate"
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Adicionar Fatura
            </button>
          </form>
        </Modal>
      )}

      {/* MODAL PARA EDITAR FATURA */}
      {invoiceToEdit && (
        <Modal title="Editar Fatura" closeHref="/dashboard/accounts">
          <form action={handleUpdateInvoice.bind(null, invoiceToEdit.id)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-inv-amount" className="text-sm font-medium">Valor da Fatura</label>
                <input
                  id="edit-inv-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={invoiceToEdit.amount}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-inv-dueDate" className="text-sm font-medium">Vencimento</label>
                <input
                  id="edit-inv-dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={invoiceToEdit.dueDate.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Salvar Fatura
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}
