"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createBill(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const scope = formData.get("scope") as string; // HOUSEHOLD or INDIVIDUAL
  const dueDateStr = formData.get("dueDate") as string;

  const paymentSource = (formData.get("paymentSource") as string) || "SALARY";

  if (!title || isNaN(amount) || !type || !scope || !dueDateStr) {
    throw new Error("Preencha todos os campos corretamente");
  }

  // ISO string construction handles "YYYY-MM-DD" from native inputs properly
  const dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  await prisma.bill.create({
    data: {
      title,
      amount,
      type,
      scope,
      dueDate,
      paymentSource,
      householdId: scope === "HOUSEHOLD" ? session.householdId : null,
      userId: scope === "INDIVIDUAL" ? session.userId : null,
    },
  });

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
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const paymentSource = (formData.get("paymentSource") as string) || "SALARY";

  if (!title || isNaN(amount) || !type || !dueDateStr) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const dueDate = new Date(`${dueDateStr}T12:00:00.000Z`);

  // Ensure user owns this bill or is part of the household
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw new Error("Conta não encontrada");
  if (bill.scope === "INDIVIDUAL" && bill.userId !== session.userId) {
    throw new Error("Sem permissão");
  }
  if (bill.scope === "HOUSEHOLD" && bill.householdId !== session.householdId) {
    throw new Error("Sem permissão");
  }

  await prisma.bill.update({
    where: { id },
    data: { title, amount, type, dueDate, paymentSource },
  });

  if (bill.scope === "HOUSEHOLD") {
    revalidatePath("/dashboard/house");
  } else {
    revalidatePath("/dashboard/personal");
  }
}

export async function deleteBill(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw new Error("Conta não encontrada");
  if (bill.scope === "INDIVIDUAL" && bill.userId !== session.userId) {
    throw new Error("Sem permissão");
  }
  if (bill.scope === "HOUSEHOLD" && bill.householdId !== session.householdId) {
    throw new Error("Sem permissão");
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
