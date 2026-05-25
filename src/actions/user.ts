"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function updateContributionPercentage(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const contributionPercentage = parseFloat(formData.get("contributionPercentage") as string);

  if (isNaN(contributionPercentage) || contributionPercentage < 0 || contributionPercentage > 100) {
    throw new Error("Porcentagem inválida");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { contributionPercentage },
  });

  revalidatePath("/dashboard/settings");
}

export async function getUserSettings() {
  const session = await getSession();
  if (!session) return null;

  return await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, contributionPercentage: true },
  });
}
