import { prisma } from "@/lib/prisma";

const LIMITS = {
  FREE: {
    maxUsers: 2,
    maxCreditCardsPerUser: 1,
    maxBankAccountsPerUser: 1,
  },
  PREMIUM: {
    maxUsers: Infinity,
    maxCreditCardsPerUser: Infinity,
    maxBankAccountsPerUser: Infinity,
  }
};

export async function checkHouseholdUserLimit(householdId: string) {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: { _count: { select: { users: true } } }
  });

  if (!household) throw new Error("Casa não encontrada");

  const plan = household.plan as keyof typeof LIMITS;
  const limit = LIMITS[plan]?.maxUsers || LIMITS.FREE.maxUsers;

  if (household._count.users >= limit) {
    throw new Error(`Limite do plano ${plan} atingido. Máximo de ${limit} usuários por casa.`);
  }
}

export async function checkCreditCardLimit(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { household: true, _count: { select: { creditCards: true } } }
  });

  if (!user || !user.household) throw new Error("Usuário ou casa não encontrada");

  const plan = user.household.plan as keyof typeof LIMITS;
  const limit = LIMITS[plan]?.maxCreditCardsPerUser || LIMITS.FREE.maxCreditCardsPerUser;

  if (user._count.creditCards >= limit) {
    throw new Error(`Limite do plano ${plan} atingido. Máximo de ${limit} cartão por usuário.`);
  }
}

export async function checkBankAccountLimit(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { household: true, _count: { select: { bankAccounts: true } } }
  });

  if (!user || !user.household) throw new Error("Usuário ou casa não encontrada");

  const plan = user.household.plan as keyof typeof LIMITS;
  const limit = LIMITS[plan]?.maxBankAccountsPerUser || LIMITS.FREE.maxBankAccountsPerUser;

  if (user._count.bankAccounts >= limit) {
    throw new Error(`Limite do plano ${plan} atingido. Máximo de ${limit} conta bancária por usuário.`);
  }
}
