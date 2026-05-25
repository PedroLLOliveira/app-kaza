"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createCreditCardWithInvoices(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const limit = parseFloat(formData.get("limit") as string) || 0;
  const baseAmount = parseFloat(formData.get("baseAmount") as string) || 0;
  const dueDay = parseInt(formData.get("dueDay") as string);
  const invoiceCount = parseInt(formData.get("invoiceCount") as string) || 1;

  if (!name || isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new Error("Preencha todos os campos corretamente");
  }

  // Create the Credit Card
  const creditCard = await prisma.creditCard.create({
    data: {
      name,
      limit,
      userId: session.userId,
    },
  });

  // Generate Invoices
  const invoices = [];
  const currentDate = new Date();
  
  for (let i = 0; i < invoiceCount; i++) {
    // Generate dates correctly handling month rollovers
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, dueDay, 12, 0, 0);
    
    invoices.push({
      creditCardId: creditCard.id,
      dueDate: dueDate,
      amount: baseAmount,
      isPaid: false,
    });
  }

  await prisma.creditCardInvoice.createMany({
    data: invoices,
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal"); // Since this affects personal balance
}

export async function getCreditCards() {
  const session = await getSession();
  if (!session) return [];

  return await prisma.creditCard.findMany({
    where: { userId: session.userId },
    include: {
      invoices: {
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function payCreditCardInvoice(invoiceId: string, currentStatus: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  // Verify ownership
  const invoice = await prisma.creditCardInvoice.findUnique({
    where: { id: invoiceId },
    include: { creditCard: true },
  });

  if (!invoice || invoice.creditCard.userId !== session.userId) {
    throw new Error("Fatura não encontrada ou sem permissão");
  }

  await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: { isPaid: !currentStatus },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal");
}

export async function deleteCreditCard(cardId: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const card = await prisma.creditCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== session.userId) {
    throw new Error("Cartão não encontrado ou sem permissão");
  }

  await prisma.creditCard.delete({
    where: { id: cardId },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal");
}

export async function createSingleCreditCardInvoice(cardId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const amount = parseFloat(formData.get("amount") as string);
  const dueDateStr = formData.get("dueDate") as string;

  if (isNaN(amount) || !dueDateStr) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  const card = await prisma.creditCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== session.userId) {
    throw new Error("Cartão não encontrado ou sem permissão");
  }

  await prisma.creditCardInvoice.create({
    data: {
      creditCardId: cardId,
      amount,
      dueDate,
      isPaid: false,
    }
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal");
}

export async function updateCreditCardInvoice(invoiceId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const amount = parseFloat(formData.get("amount") as string);
  const dueDateStr = formData.get("dueDate") as string;

  if (isNaN(amount) || !dueDateStr) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  const invoice = await prisma.creditCardInvoice.findUnique({
    where: { id: invoiceId },
    include: { creditCard: true },
  });

  if (!invoice || invoice.creditCard.userId !== session.userId) {
    throw new Error("Fatura não encontrada ou sem permissão");
  }

  await prisma.creditCardInvoice.update({
    where: { id: invoiceId },
    data: { amount, dueDate },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal");
}

export async function deleteCreditCardInvoice(invoiceId: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const invoice = await prisma.creditCardInvoice.findUnique({
    where: { id: invoiceId },
    include: { creditCard: true },
  });

  if (!invoice || invoice.creditCard.userId !== session.userId) {
    throw new Error("Fatura não encontrada ou sem permissão");
  }

  await prisma.creditCardInvoice.delete({
    where: { id: invoiceId },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/personal");
}

export async function getCurrentMonthInvoices() {
  const session = await getSession();
  if (!session) return [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return await prisma.creditCardInvoice.findMany({
    where: {
      creditCard: { userId: session.userId },
      dueDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      creditCard: {
        select: { name: true }
      }
    },
    orderBy: { dueDate: "asc" }
  });
}
