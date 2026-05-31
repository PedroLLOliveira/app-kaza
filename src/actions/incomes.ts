"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth, verifyOwnership } from "@/lib/permissions";

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(1),
  isSharedPool: z.coerce.boolean().default(false),
  debtorName: z.string().optional().nullable(),
  destination: z.string().optional().nullable()
});

export async function createIncome(formData: FormData) {
  const session = await requireAuth();

  const parsed = incomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const { name, amount, type, isSharedPool, debtorName, destination } = parsed.data;

  await prisma.income.create({
    data: {
      name,
      amount,
      type,
      isSharedPool,
      debtorName: type === "LOAN" ? debtorName : null,
      destination: type === "LOAN" ? destination : null,
      userId: session.userId,
    },
  });

  revalidatePath("/dashboard/personal");
}

export async function getIncomes() {
  const session = await requireAuth();

  return await prisma.income.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
}

export async function updateIncome(id: string, formData: FormData) {
  const session = await requireAuth();

  const parsed = incomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const { name, amount, type, isSharedPool, debtorName, destination } = parsed.data;

  const income = await prisma.income.findUnique({ where: { id } });
  if (!income) throw new Error("Renda não encontrada");
  
  verifyOwnership(income.userId, session.userId);

  await prisma.income.update({
    where: { id },
    data: { 
      name, 
      amount, 
      type, 
      isSharedPool,
      debtorName: type === "LOAN" ? debtorName : null,
      destination: type === "LOAN" ? destination : null,
    },
  });

  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/house");
}

export async function deleteIncome(id: string) {
  const session = await requireAuth();

  const income = await prisma.income.findUnique({ where: { id } });
  if (!income) throw new Error("Renda não encontrada");
  
  verifyOwnership(income.userId, session.userId);

  await prisma.income.delete({
    where: { id },
  });

  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/house");
}
