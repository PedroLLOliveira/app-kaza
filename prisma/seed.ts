import { prisma } from '../src/lib/prisma';

async function main() {
  const householdId = '22222222-2222-2222-2222-222222222222';
  const userId = '11111111-1111-1111-1111-111111111111';

  // Create Household
  const household = await prisma.household.upsert({
    where: { id: householdId },
    update: {},
    create: {
      id: householdId,
      name: 'Minha Casa',
    },
  });

  // Create User
  const user = await prisma.user.upsert({
    where: { email: 'admin@kaza.com' },
    update: {},
    create: {
      id: userId,
      email: 'admin@kaza.com',
      name: 'Admin',
      password: 'password', // in a real app this would be hashed
      householdId: household.id,
      contributionPercentage: 50,
    },
  });

  console.log({ household, user });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
