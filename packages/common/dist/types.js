"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyExpenseWithCashOnHandSchema = exports.expenseSchema = exports.monthlyExpenseSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
// User Schema
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(), // Optional because Prisma generates it
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    mobile: zod_1.z.string(),
    password: zod_1.z.string().optional(),
    auth0Id: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    createdAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    updatedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    deletedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
});
// MonthlyExpense Schema
exports.monthlyExpenseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    month: zod_1.z.number(), // e.g., "2025-03"
    budgetGoal: zod_1.z.number().positive(),
    userId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    updatedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    deletedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
});
// Expense Schema
exports.expenseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string(),
    category: zod_1.z.enum([
        "TRANSPORTATION",
        "GROCERY",
        "SCHOOL",
        "CAR",
        "HOUSE",
        "TRAVEL",
        "PERSONAL",
        "KIDS",
        "MISCELLANEOUS",
    ]),
    amount: zod_1.z.number().positive(),
    date: zod_1.z.string().datetime(),
    monthlyExpenseId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    updatedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
    deletedAt: zod_1.z.string().datetime().optional(), // Optional as it’s defaulted
});
// Combined type for response with cashOnHand
exports.monthlyExpenseWithCashOnHandSchema = exports.monthlyExpenseSchema.extend({
    expenses: zod_1.z.array(exports.expenseSchema).optional(),
    cashOnHand: zod_1.z.number(),
});
