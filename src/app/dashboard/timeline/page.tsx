import { getSession } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Calendar, CreditCard as CardIcon } from "lucide-react";

interface TimelineItem {
  id: string;
  type: "INCOME" | "BILL" | "INVOICE";
  title: string;
  amount: number;
  date: Date;
  category?: string;
  icon?: any;
}

export default async function TimelinePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all Incomes
  const incomes = await prisma.income.findMany({
    where: {
      userId: session.userId
    }
  });

  // Fetch Paid Bills
  const bills = await prisma.bill.findMany({
    where: {
      isPaid: true,
      OR: [
        { userId: session.userId },
        { householdId: session.householdId }
      ]
    }
  });

  // Fetch Paid Invoices
  const invoices = await prisma.creditCardInvoice.findMany({
    where: {
      isPaid: true,
      creditCard: { userId: session.userId }
    },
    include: { creditCard: true }
  });

  // Unify and sort
  let timeline: TimelineItem[] = [];

  incomes.forEach(i => {
    timeline.push({
      id: i.id,
      type: "INCOME",
      title: i.name,
      amount: i.amount,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      icon: ArrowUpRight
    });
  });

  bills.forEach(b => {
    timeline.push({
      id: b.id,
      type: "BILL",
      title: b.title,
      amount: b.amount,
      date: b.dueDate, // or an `updatedAt` for when it was paid, but dueDate is fine
      category: b.category || "Outros",
      icon: ArrowDownRight
    });
  });

  invoices.forEach(inv => {
    timeline.push({
      id: inv.id,
      type: "INVOICE",
      title: `Pagamento Fatura ${inv.creditCard.name}`,
      amount: inv.amount,
      date: inv.dueDate,
      icon: CardIcon
    });
  });

  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by month/year for better UI (optional, but let's keep it simple flat list first)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extrato Geral</h1>
          <p className="text-muted-foreground">Sua linha do tempo de entradas e saídas.</p>
        </div>
      </div>

      <div className="glass-panel p-4 md:p-8 rounded-3xl">
        <div className="space-y-4 relative">
          {/* Vertical line connecting timeline */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border hidden md:block" />
          
          {timeline.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação encontrada.</p>
          ) : (
            timeline.map((item, index) => {
              const isIncome = item.type === "INCOME";
              const Icon = item.icon;

              return (
                <div key={`${item.type}-${item.id}`} className="relative flex gap-4 md:gap-6 items-start group">
                  <div className={`hidden md:flex relative z-10 w-14 h-14 rounded-2xl items-center justify-center shrink-0 border-4 border-background transition-transform group-hover:scale-110 ${isIncome ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 bg-background/50 hover:bg-background border border-border p-4 rounded-2xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 md:gap-0">
                      <div className={`flex md:hidden w-10 h-10 rounded-xl items-center justify-center shrink-0 ${isIncome ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                          {item.category && <span className="ml-2 px-2 py-0.5 bg-muted rounded-md">{item.category}</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`text-lg font-bold text-right ${isIncome ? 'text-green-500' : 'text-foreground'}`}>
                      {isIncome ? "+" : "-"} 
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
