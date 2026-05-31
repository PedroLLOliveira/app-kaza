"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth, verifyScopeAccess } from "@/lib/permissions";

const billSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(1),
  scope: z.enum(["INDIVIDUAL", "HOUSEHOLD"]).default("INDIVIDUAL"),
  dueDate: z.string().min(1),
  paymentSource: z.string().default("SALARY"),
  creditCardId: z.string().optional().nullable(),
  invoiceMonth: z.string().optional().nullable(),
  category: z.string().default("OUTROS")
});

export async function createBill(formData: FormData) {
  const session = await requireAuth();

  const parsed = billSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const { title, amount, type, scope, dueDate: dueDateStr, paymentSource, creditCardId, invoiceMonth, category } = parsed.data;

  verifyScopeAccess(scope, session.userId, session.householdId, session.userId, session.householdId);

  // ISO string construction handles "YYYY-MM-DD" from native inputs properly
  let dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  if (paymentSource === "CREDIT_CARD" && invoiceMonth) {
    const [y, m] = invoiceMonth.split("-");
    dueDate = new Date(parseInt(y), parseInt(m) - 1, dueDate.getDate(), 12, 0, 0);
  }

  await prisma.bill.create({
    data: {
      title,
      amount,
      type,
      scope,
      dueDate,
      paymentSource,
      creditCardId: paymentSource === "CREDIT_CARD" ? creditCardId : null,
      householdId: scope === "HOUSEHOLD" ? session.householdId : null,
      userId: scope === "INDIVIDUAL" ? session.userId : null,
      category,
    },
  });

  if (paymentSource === "CREDIT_CARD" && creditCardId) {
    await adjustInvoice(creditCardId, dueDate, amount);
  }

  if (scope === "HOUSEHOLD") {
    revalidatePath("/dashboard/house");
  } else {
    revalidatePath("/dashboard/personal");
  }
}

export async function getHouseholdBills() {
  const session = await getSession();
  if (!session) return [];

  return await prisma.bill.findMany({
    where: { 
      scope: "HOUSEHOLD",
      householdId: session.householdId 
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getPersonalBills() {
  const session = await getSession();
  if (!session) return [];

  return await prisma.bill.findMany({
    where: { 
      scope: "INDIVIDUAL",
      userId: session.userId 
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function toggleBillStatus(billId: string, currentStatus: boolean, scope: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  await prisma.bill.update({
    where: { id: billId },
    data: { isPaid: !currentStatus },
  });

  if (scope === "HOUSEHOLD") {
    revalidatePath("/dashboard/house");
  } else {
    revalidatePath("/dashboard/personal");
  }
}

export async function updateBill(id: string, formData: FormData) {
  const session = await requireAuth();

  const parsed = billSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const { title, amount, type, dueDate: dueDateStr, paymentSource, creditCardId, invoiceMonth, category } = parsed.data;

  let dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  if (paymentSource === "CREDIT_CARD" && invoiceMonth) {
    const [y, m] = invoiceMonth.split("-");
    dueDate = new Date(parseInt(y), parseInt(m) - 1, dueDate.getDate(), 12, 0, 0);
  }

  // Ensure user owns this bill or is part of the household
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw new Error("Conta não encontrada");
  
  verifyScopeAccess(bill.scope, bill.userId, bill.householdId, session.userId, session.householdId);

  if (bill.paymentSource === "CREDIT_CARD" && bill.creditCardId) {
    await adjustInvoice(bill.creditCardId, bill.dueDate, -bill.amount);
  }

  await prisma.bill.update({
    where: { id },
    data: { 
      title, 
      amount, 
      type, 
      dueDate, 
      paymentSource,
      creditCardId: paymentSource === "CREDIT_CARD" ? creditCardId : null,
      category
    },
  });

  if (paymentSource === "CREDIT_CARD" && creditCardId) {
    await adjustInvoice(creditCardId, dueDate, amount);
  }

  if (bill.scope === "HOUSEHOLD") {
    revalidatePath("/dashboard/house");
  } else {
    revalidatePath("/dashboard/personal");
  }
}

export async function deleteBill(id: string) {
  const session = await requireAuth();

  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw new Error("Conta não encontrada");
  
  verifyScopeAccess(bill.scope, bill.userId, bill.householdId, session.userId, session.householdId);

  if (bill.paymentSource === "CREDIT_CARD" && bill.creditCardId) {
    await adjustInvoice(bill.creditCardId, bill.dueDate, -bill.amount);
  }

  await prisma.bill.delete({
    where: { id },
  });

  if (bill.scope === "HOUSEHOLD") {
    revalidatePath("/dashboard/house");
  } else {
    revalidatePath("/dashboard/personal");
  }
}

async function adjustInvoice(creditCardId: string, date: Date, amountDelta: number) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

  const invoice = await prisma.creditCardInvoice.findFirst({
    where: { creditCardId, dueDate: { gte: startOfMonth, lte: endOfMonth } }
  });

  if (invoice) {
    const newAmount = invoice.amount + amountDelta;
    if (newAmount <= 0) {
      await prisma.creditCardInvoice.delete({ where: { id: invoice.id } });
    } else {
      await prisma.creditCardInvoice.update({
        where: { id: invoice.id },
        data: { amount: newAmount }
      });
    }
  } else if (amountDelta > 0) {
    await prisma.creditCardInvoice.create({
      data: { creditCardId, dueDate: date, amount: amountDelta, isPaid: false }
    });
  }
}
