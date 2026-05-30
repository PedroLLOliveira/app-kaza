import { prisma } from "@/lib/prisma";

export async function calculateHouseIncome(householdId: string) {
  const users = await prisma.user.findMany({
    where: { householdId },
    include: {
      incomes: {
        where: { isSharedPool: true },
      },
    },
  });

  let totalSalary = 0;
  let totalFoodVoucher = 0;

  for (const user of users) {
    const contributionFraction = user.contributionPercentage / 100;

    for (const income of user.incomes) {
      if (income.type === "BENEFIT" || income.type === "FOOD_VOUCHER") {
        totalFoodVoucher += income.amount;
      } else {
        totalSalary += income.amount * contributionFraction;
      }
    }
  }

  return { salary: totalSalary, foodVoucher: totalFoodVoucher };
}

export async function calculatePersonalIncome(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { incomes: true },
  });

  if (!user) return { salary: 0, foodVoucher: 0 };

  let salary = 0;
  let foodVoucher = 0;
  const contributionFraction = user.contributionPercentage / 100;
  const remainingFraction = 1 - contributionFraction;

  for (const income of user.incomes) {
    let effectiveAmount = 0;
    
    if (!income.isSharedPool) {
      effectiveAmount = income.amount;
    } else {
      if (income.type === "BENEFIT" || income.type === "FOOD_VOUCHER") {
        effectiveAmount = 0;
      } else {
        effectiveAmount = income.amount * remainingFraction;
      }
    }

    if (income.type === "BENEFIT" || income.type === "FOOD_VOUCHER") {
      foodVoucher += effectiveAmount;
    } else {
      salary += effectiveAmount;
    }
  }

  return { salary, foodVoucher };
}

export async function calculateHouseBalance(householdId: string) {
  const incomes = await calculateHouseIncome(householdId);
  
  const paidBillsSalaryAgg = await prisma.bill.aggregate({
    where: { scope: "HOUSEHOLD", householdId, isPaid: true, paymentSource: "SALARY" },
    _sum: { amount: true }
  });

  const paidBillsFoodAgg = await prisma.bill.aggregate({
    where: { scope: "HOUSEHOLD", householdId, isPaid: true, paymentSource: "FOOD_VOUCHER" },
    _sum: { amount: true }
  });

  const paidBillsSalary = paidBillsSalaryAgg._sum.amount || 0;
  const paidBillsFood = paidBillsFoodAgg._sum.amount || 0;

  return {
    salaryIncome: incomes.salary,
    foodVoucherIncome: incomes.foodVoucher,
    salaryBalance: incomes.salary - paidBillsSalary,
    foodVoucherBalance: incomes.foodVoucher - paidBillsFood,
    paidBillsSalary,
    paidBillsFood
  };
}

export async function getPersonalBreakdown(userId: string) {
  const incomes = await calculatePersonalIncome(userId);
  
  const paidBillsSalaryAgg = await prisma.bill.aggregate({
    where: { scope: "INDIVIDUAL", userId, isPaid: true, paymentSource: "SALARY" },
    _sum: { amount: true }
  });

  const paidBillsFoodAgg = await prisma.bill.aggregate({
    where: { scope: "INDIVIDUAL", userId, isPaid: true, paymentSource: "FOOD_VOUCHER" },
    _sum: { amount: true }
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const paidInvoicesAgg = await prisma.creditCardInvoice.aggregate({
    where: {
      creditCard: { userId },
      isPaid: true,
      dueDate: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    _sum: { amount: true }
  });

  const paidBillsSalary = paidBillsSalaryAgg._sum.amount || 0;
  const paidBillsFood = paidBillsFoodAgg._sum.amount || 0;
  const paidInvoices = paidInvoicesAgg._sum.amount || 0;
  
  const salaryBalance = incomes.salary - paidBillsSalary - paidInvoices;
  const foodVoucherBalance = incomes.foodVoucher - paidBillsFood;

  return {
    salaryIncome: incomes.salary,
    foodVoucherIncome: incomes.foodVoucher,
    paidBillsSalary,
    paidBillsFood,
    paidInvoices,
    salaryBalance,
    foodVoucherBalance
  };
}

export async function getPersonalMonthlyExpenses(userId: string) {
  const bills = await prisma.bill.findMany({
    where: { scope: "INDIVIDUAL", userId },
    select: { amount: true, dueDate: true }
  });

  const invoices = await prisma.creditCardInvoice.findMany({
    where: { creditCard: { userId } },
    select: { amount: true, dueDate: true }
  });

  const monthlyData: Record<string, number> = {};

  const processItem = (item: { amount: number, dueDate: Date }) => {
    // Format YYYY-MM for sorting
    const year = item.dueDate.getFullYear();
    const month = (item.dueDate.getMonth() + 1).toString().padStart(2, '0');
    const key = `${year}-${month}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = 0;
    }
    monthlyData[key] += item.amount;
  };

  bills.forEach(processItem);
  invoices.forEach(processItem);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const sortedKeys = Object.keys(monthlyData).sort();

  return sortedKeys.map(key => {
    const [year, month] = key.split("-");
    const monthName = monthNames[parseInt(month) - 1];
    return {
      id: key,
      label: `${monthName} ${year.slice(-2)}`,
      value: monthlyData[key]
    };
  });
}
