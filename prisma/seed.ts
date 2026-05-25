import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o Seed do Supabase...");

  const householdId = "22222222-2222-2222-2222-222222222222";
  const userId = "11111111-1111-1111-1111-111111111111";

  // Upsert Household
  const house = await prisma.household.upsert({
    where: { id: householdId },
    update: {},
    create: {
      id: householdId,
      name: "Minha Casa",
    },
  });

  console.log("Casa garantida:", house.name);

  // Upsert User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: "Pedro",
      email: "pedro@kaza.com",
      password: "123", // Fake password because login is mocked
      householdId: house.id,
      contributionPercentage: 50,
    },
  });

  console.log("Usuário garantido:", user.name);

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
