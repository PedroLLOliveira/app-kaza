"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createBankAccount(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const balance = parseFloat(formData.get("balance") as string) || 0;

  if (!name) throw new Error("Nome da conta é obrigatório");

  await prisma.bankAccount.create({
    data: {
      name,
      balance,
      userId: session.userId,
    },
  });

  revalidatePath("/dashboard/accounts");
}

export async function getBankAccounts() {
  const session = await getSession();
  if (!session) return [];

  return await prisma.bankAccount.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
}

export async function updateBankAccount(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const balance = parseFloat(formData.get("balance") as string);

  if (!name || isNaN(balance)) {
    throw new Error("Preencha todos os campos corretamente");
  }

  // Ensure user owns this account
  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account || account.userId !== session.userId) {
    throw new Error("Conta não encontrada ou sem permissão");
  }

  await prisma.bankAccount.update({
    where: { id },
    data: { name, balance },
  });

  revalidatePath("/dashboard/accounts");
}

export async function deleteBankAccount(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  // Ensure user owns this account
  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account || account.userId !== session.userId) {
    throw new Error("Conta não encontrada ou sem permissão");
  }

  await prisma.bankAccount.delete({
    where: { id },
  });

  revalidatePath("/dashboard/accounts");
}
