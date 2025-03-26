import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    mobile: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    auth0Id: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mobile: string;
    email: string;
    id?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    password?: string | undefined;
    auth0Id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}, {
    mobile: string;
    email: string;
    id?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    password?: string | undefined;
    auth0Id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}>;
export type User = z.infer<typeof userSchema> & {
    monthlyExpenses?: MonthlyExpense[];
};
export declare const monthlyExpenseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    month: z.ZodNumber;
    budgetGoal: z.ZodNumber;
    userId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    month: number;
    budgetGoal: number;
    userId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}, {
    month: number;
    budgetGoal: number;
    userId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}>;
export type MonthlyExpense = z.infer<typeof monthlyExpenseSchema> & {
    expenses?: Expense[];
    user?: User;
};
export declare const expenseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    category: z.ZodEnum<["TRANSPORTATION", "GROCERY", "SCHOOL", "CAR", "HOUSE", "TRAVEL", "PERSONAL", "KIDS", "MISCELLANEOUS"]>;
    amount: z.ZodNumber;
    date: z.ZodString;
    monthlyExpenseId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
    date: string;
    amount: number;
    monthlyExpenseId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}, {
    description: string;
    category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
    date: string;
    amount: number;
    monthlyExpenseId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
}>;
export type Expense = z.infer<typeof expenseSchema> & {
    monthlyExpense?: MonthlyExpense;
};
export declare const monthlyExpenseWithCashOnHandSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodString>;
    month: z.ZodNumber;
    budgetGoal: z.ZodNumber;
    userId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    deletedAt: z.ZodOptional<z.ZodString>;
}, {
    expenses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        category: z.ZodEnum<["TRANSPORTATION", "GROCERY", "SCHOOL", "CAR", "HOUSE", "TRAVEL", "PERSONAL", "KIDS", "MISCELLANEOUS"]>;
        amount: z.ZodNumber;
        date: z.ZodString;
        monthlyExpenseId: z.ZodString;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
        date: string;
        amount: number;
        monthlyExpenseId: string;
        id?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        deletedAt?: string | undefined;
    }, {
        description: string;
        category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
        date: string;
        amount: number;
        monthlyExpenseId: string;
        id?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        deletedAt?: string | undefined;
    }>, "many">>;
    cashOnHand: z.ZodNumber;
}>, "strip", z.ZodTypeAny, {
    month: number;
    budgetGoal: number;
    userId: string;
    cashOnHand: number;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
    expenses?: {
        description: string;
        category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
        date: string;
        amount: number;
        monthlyExpenseId: string;
        id?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        deletedAt?: string | undefined;
    }[] | undefined;
}, {
    month: number;
    budgetGoal: number;
    userId: string;
    cashOnHand: number;
    id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
    expenses?: {
        description: string;
        category: "TRANSPORTATION" | "GROCERY" | "SCHOOL" | "CAR" | "HOUSE" | "TRAVEL" | "PERSONAL" | "KIDS" | "MISCELLANEOUS";
        date: string;
        amount: number;
        monthlyExpenseId: string;
        id?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        deletedAt?: string | undefined;
    }[] | undefined;
}>;
export type MonthlyExpenseWithCashOnHand = z.infer<typeof monthlyExpenseWithCashOnHandSchema>;
