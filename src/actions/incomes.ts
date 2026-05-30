"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createIncome(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const isSharedPool = formData.get("isSharedPool") === "true";
  const debtorName = formData.get("debtorName") as string | null;
  const destination = formData.get("destination") as string | null;

  if (!name || isNaN(amount) || !type) throw new Error("Preencha todos os campos corretamente");

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
  const session = await getSession();
  if (!session) return [];

  return await prisma.income.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
}

export async function updateIncome(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const isSharedPool = formData.get("isSharedPool") === "true";
  const debtorName = formData.get("debtorName") as string | null;
  const destination = formData.get("destination") as string | null;

  if (!name || isNaN(amount) || !type) {
    throw new Error("Preencha todos os campos corretamente");
  }

  // Ensure user owns this income
  const income = await prisma.income.findUnique({ where: { id } });
  if (!income || income.userId !== session.userId) {
    throw new Error("Renda não encontrada ou sem permissão");
  }

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
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  // Ensure user owns this income
  const income = await prisma.income.findUnique({ where: { id } });
  if (!income || income.userId !== session.userId) {
    throw new Error("Renda não encontrada ou sem permissão");
  }

  await prisma.income.delete({
    where: { id },
  });

  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/house");
}
