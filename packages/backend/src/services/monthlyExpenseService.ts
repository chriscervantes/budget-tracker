import { PrismaClient } from '@prisma/client';
import { monthlyExpenseSchema } from '@budget-tracker/common';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createMonthlyExpense = async (
  data: z.infer<typeof monthlyExpenseSchema>,
  userId: string,
) => {
  return prisma.monthlyExpense.create({
    data: {
      month: data.month,
      budgetGoal: data.budgetGoal,
      userId,
    },
  });
};

export const getMonthlyExpense = async (id: string, userId: string) => {
  const monthlyExpense = await prisma.monthlyExpense.findFirst({
    where: {
      id,
      userId, // This should work as userId is a scalar field
    },
    include: { expenses: true },
  });

  if (!monthlyExpense) throw new Error('Not found');

  const cashOnHand =
    monthlyExpense.budgetGoal -
    monthlyExpense.expenses.reduce((sum, e) => sum + e.amount, 0);
  return { ...monthlyExpense, cashOnHand };
};

export const getMonthlyExpenses = async (userId: string) => {
  const monthlyExpense = await prisma.monthlyExpense.findMany({
    where: {
      userId, // This should work as userId is a scalar field
    },
    include: { expenses: true },
  });

  if (!monthlyExpense) throw new Error('Not found');

  return { ...monthlyExpense };
};
