import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 1. Verificação de Segurança (CRON_SECRET)
  // Vercel envia automaticamente o header Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  
  // Em produção, isso garante que apenas o Vercel Cron acesse essa rota.
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 0. Rollover de Contas Fixas
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const fixedBillsLastMonth = await prisma.bill.findMany({
      where: {
        type: "FIXED",
        dueDate: { gte: lastMonth, lte: endOfLastMonth }
      }
    });

    let rolloverCount = 0;
    for (const bill of fixedBillsLastMonth) {
      const currentMonthDueDate = new Date(bill.dueDate);
      currentMonthDueDate.setMonth(currentMonthDueDate.getMonth() + 1);

      const startOfCurrentMonth = new Date(currentMonthDueDate.getFullYear(), currentMonthDueDate.getMonth(), 1);
      const endOfCurrentMonth = new Date(currentMonthDueDate.getFullYear(), currentMonthDueDate.getMonth() + 1, 0, 23, 59, 59);

      const exists = await prisma.bill.findFirst({
        where: {
          title: bill.title,
          scope: bill.scope,
          userId: bill.userId,
          householdId: bill.householdId,
          dueDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
        }
      });

      if (!exists) {
        await prisma.bill.create({
          data: {
            title: bill.title,
            amount: bill.amount,
            type: "FIXED",
            scope: bill.scope,
            dueDate: currentMonthDueDate,
            isPaid: false,
            paymentSource: bill.paymentSource,
            householdId: bill.householdId,
            userId: bill.userId,
            creditCardId: bill.creditCardId,
            category: bill.category
          }
        });
        
        if (bill.paymentSource === "CREDIT_CARD" && bill.creditCardId) {
          const invStart = new Date(currentMonthDueDate.getFullYear(), currentMonthDueDate.getMonth(), 1);
          const invEnd = new Date(currentMonthDueDate.getFullYear(), currentMonthDueDate.getMonth() + 1, 0, 23, 59, 59);
          const invoice = await prisma.creditCardInvoice.findFirst({
            where: { creditCardId: bill.creditCardId, dueDate: { gte: invStart, lte: invEnd } }
          });
          if (invoice) {
            await prisma.creditCardInvoice.update({ where: { id: invoice.id }, data: { amount: invoice.amount + bill.amount }});
          } else {
            await prisma.creditCardInvoice.create({ data: { creditCardId: bill.creditCardId, dueDate: currentMonthDueDate, amount: bill.amount, isPaid: false }});
          }
        }
        rolloverCount++;
      }
    }
    
    // 1. Procurar faturas em atraso (já venceram e não pagas)
    const overdueInvoices = await prisma.creditCardInvoice.findMany({
      where: { dueDate: { lt: now }, isPaid: false },
      select: { id: true, amount: true, dueDate: true, creditCard: { select: { userId: true, name: true } } }
    });

    for (const inv of overdueInvoices) {
      await prisma.notification.create({
        data: {
          userId: inv.creditCard.userId,
          message: `Sua fatura do ${inv.creditCard.name} está atrasada desde ${inv.dueDate.toLocaleDateString("pt-BR")}!`,
          type: "ALERT"
        }
      });
    }

    // 2. Procurar contas que vencem amanhã
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const upcomingBills = await prisma.bill.findMany({
      where: { dueDate: { gte: startOfTomorrow, lte: tomorrow }, isPaid: false },
      select: { id: true, title: true, amount: true, scope: true, userId: true, householdId: true }
    });

    for (const bill of upcomingBills) {
      await prisma.notification.create({
        data: {
          userId: bill.scope === "INDIVIDUAL" ? bill.userId : null,
          householdId: bill.scope === "HOUSEHOLD" ? bill.householdId : null,
          message: `Lembrete: A conta '${bill.title}' vence amanhã!`,
          type: "WARNING"
        }
      });
    }

    console.log(`[CRON] Rollover Mensal executado. Contas clonadas: ${rolloverCount}, Faturas em atraso notificadas: ${overdueInvoices.length}, Contas de amanhã notificadas: ${upcomingBills.length}`);
    
    return NextResponse.json({ 
      status: "success", 
      message: "Rollover e notificações concluídas.",
      clonedFixedBills: rolloverCount,
      notifiedOverdue: overdueInvoices.length,
      notifiedUpcoming: upcomingBills.length
    });
  } catch (error: any) {
    console.error("[CRON] Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
