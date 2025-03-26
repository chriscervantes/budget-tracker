import { PrismaClient } from "@prisma/client";
import { expenseSchema } from "@budget-tracker/common";
import { z } from "zod";

const prisma = new PrismaClient();

export const createExpense = async (data: z.infer<typeof expenseSchema>) => {
  return prisma.expense.create({
    data: {
      description: data.description,
      category: data.category,
      amount: data.amount,
      date: new Date(data.date),
      monthlyExpenseId: data.monthlyExpenseId,
    },
  });
};

export const updateExpense = async (
  id: string,
  data: Partial<z.infer<typeof expenseSchema>>
) => {
  return prisma.expense.update({
    where: { id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
};

export const deleteExpense = async (id: string) => {
  return prisma.expense.delete({ where: { id } });
};
