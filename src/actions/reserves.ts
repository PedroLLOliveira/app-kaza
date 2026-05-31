"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import { requireAuth, verifyScopeAccess } from "@/lib/permissions";
import { z } from "zod";

const reserveSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).default(0),
  scope: z.enum(["INDIVIDUAL", "HOUSEHOLD"]).default("INDIVIDUAL"),
});

export async function createReserve(formData: FormData) {
  const session = await requireAuth();

  const parsed = reserveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Preencha todos os campos corretamente");
  }

  const { name, targetAmount, currentAmount, scope } = parsed.data;

  verifyScopeAccess(scope, session.userId, session.householdId, session.userId, session.householdId);

  await prisma.reserve.create({
    data: {
      name,
      targetAmount,
      currentAmount,
      scope,
      householdId: scope === "HOUSEHOLD" ? session.householdId : null,
      userId: scope === "INDIVIDUAL" ? session.userId : null,
    },
  });

  if (scope === "HOUSEHOLD") revalidatePath("/dashboard/house");
  else revalidatePath("/dashboard/personal");
}

export async function updateReserveAmount(id: string, newAmount: number) {
  const session = await requireAuth();

  const reserve = await prisma.reserve.findUnique({ where: { id } });
  if (!reserve) throw new Error("Meta não encontrada");

  verifyScopeAccess(reserve.scope, reserve.userId, reserve.householdId, session.userId, session.householdId);

  await prisma.reserve.update({
    where: { id },
    data: { currentAmount: newAmount }
  });

  if (reserve.scope === "HOUSEHOLD") revalidatePath("/dashboard/house");
  else revalidatePath("/dashboard/personal");
}

export async function deleteReserve(id: string) {
  const session = await requireAuth();

  const reserve = await prisma.reserve.findUnique({ where: { id } });
  if (!reserve) throw new Error("Meta não encontrada");

  verifyScopeAccess(reserve.scope, reserve.userId, reserve.householdId, session.userId, session.householdId);

  await prisma.reserve.delete({ where: { id } });

  if (reserve.scope === "HOUSEHOLD") revalidatePath("/dashboard/house");
  else revalidatePath("/dashboard/personal");
}

export async function getReserves(scope: "HOUSEHOLD" | "INDIVIDUAL") {
  const session = await getSession();
  if (!session) return [];

  const whereClause = scope === "HOUSEHOLD" 
    ? { scope: "HOUSEHOLD", householdId: session.householdId } 
    : { scope: "INDIVIDUAL", userId: session.userId };

  return await prisma.reserve.findMany({
    where: whereClause,
    orderBy: { targetAmount: "desc" },
  });
}
