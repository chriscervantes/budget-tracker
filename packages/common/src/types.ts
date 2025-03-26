import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string().uuid().optional(), // Optional because Prisma generates it
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  mobile: z.string(),
  password: z.string().optional(),
  auth0Id: z.string().optional(),
  email: z.string().email(),
  createdAt: z.string().datetime().optional(), // Optional as it’s defaulted
  updatedAt: z.string().datetime().optional(), // Optional as it’s defaulted
  deletedAt: z.string().datetime().optional(), // Optional as it’s defaulted
});

export type User = z.infer<typeof userSchema> & {
  monthlyExpenses?: MonthlyExpense[]; // Optional relation
};

// MonthlyExpense Schema
export const monthlyExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  month: z.number(), // e.g., "2025-03"
  budgetGoal: z.number().positive(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime().optional(), // Optional as it’s defaulted
  updatedAt: z.string().datetime().optional(), // Optional as it’s defaulted
  deletedAt: z.string().datetime().optional(), // Optional as it’s defaulted
});

export type MonthlyExpense = z.infer<typeof monthlyExpenseSchema> & {
  expenses?: Expense[]; // Optional relation
  user?: User; // Optional relation
};

export const expenseCategoryEnum = z.enum([
  "TRANSPORTATION",
  "GROCERY",
  "SCHOOL",
  "CAR",
  "HOUSE",
  "TRAVEL",
  "PERSONAL",
  "KIDS",
  "MISCELLANEOUS",
]);

// Expense Schema
export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string(),
  category: expenseCategoryEnum,
  amount: z.number().positive(),
  date: z.string().datetime(),
  monthlyExpenseId: z.string().uuid(),
  createdAt: z.string().datetime().optional(), // Optional as it’s defaulted
  updatedAt: z.string().datetime().optional(), // Optional as it’s defaulted
  deletedAt: z.string().datetime().optional(), // Optional as it’s defaulted
});

export type Expense = z.infer<typeof expenseSchema> & {
  monthlyExpense?: MonthlyExpense; // Optional relation
};

// Combined type for response with cashOnHand
export const monthlyExpenseWithCashOnHandSchema = monthlyExpenseSchema.extend({
  expenses: z.array(expenseSchema).optional(),
  cashOnHand: z.number(),
});

export type MonthlyExpenseWithCashOnHand = z.infer<
  typeof monthlyExpenseWithCashOnHandSchema
>;
