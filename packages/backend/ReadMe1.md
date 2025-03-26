Step 1: Project Structure
We'll use a monorepo with Lerna to manage shared code (e.g., common library) and the backend app.

expense-tracker/
├── packages/
│   ├── common/               # Shared library (types, utilities, etc.)
│   └── backend/              # Express API
├── lerna.json
├── package.json
├── tsconfig.json
└── .github/                  # GitHub Actions & Dependabot config

Step 2: Setup Monorepo with Lerna
Initialize Project:
bash

mkdir expense-tracker
cd expense-tracker
npm init -y
npx lerna init

Install Dependencies:
bash

npm install -D typescript @types/node lerna
npm install eslint prettier eslint-config-airbnb-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-config-prettier eslint-plugin-prettier

Create Base tsconfig.json:
json

{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "."
  }
}

Setup Lerna Config (lerna.json):
json

{
  "packages": ["packages/*"],
  "version": "independent",
  "npmClient": "npm"
}

Step 3: Common Library (packages/common)
This will contain shared types, utilities, and configurations.
Initialize Package:
bash

cd packages
mkdir common
cd common
npm init -y
npm install -D typescript
npm install zod

Create Shared Types:
packages/common/src/types.ts
ts

import { z } from "zod";

export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  monthlyExpenseId: z.string().uuid(),
});

export const monthlyExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  month: z.string(), // e.g., "2025-03"
  budgetGoal: z.number().positive(),
});

export type Expense = z.infer<typeof expenseSchema>;
export type MonthlyExpense = z.infer<typeof monthlyExpenseSchema>;

Build Config:
packages/common/tsconfig.json
json

{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}

Add Build Script:
packages/common/package.json
json

{
  "name": "@expense-tracker/common",
  "version": "0.0.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}

Step 4: Backend Setup (packages/backend)
Initialize Package:
bash

cd packages
mkdir backend
cd backend
npm init -y
npm install express @types/express prisma @prisma/client zod
npm install -D typescript jest @types/jest ts-jest supertest @types/supertest

Setup Prisma:
bash

npx prisma init

Edit prisma/schema.prisma:
prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model MonthlyExpense {
  id         String    @id @default(uuid())
  month      String    // e.g., "2025-03"
  budgetGoal Float
  expenses   Expense[]
}

model Expense {
  id              String        @id @default(uuid())
  description     String
  amount          Float
  date            DateTime
  monthlyExpense  MonthlyExpense @relation(fields: [monthlyExpenseId], references: [id])
  monthlyExpenseId String
}

Add .env:

DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"

Run:
bash

npx prisma migrate dev --name init

Express Setup:
packages/backend/src/index.ts
ts

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { expenseSchema, monthlyExpenseSchema } from "@expense-tracker/common";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Create Monthly Expense
app.post("/monthly-expenses", async (req: Request, res: Response) => {
  try {
    const data = monthlyExpenseSchema.parse(req.body);
    const monthlyExpense = await prisma.monthlyExpense.create({
      data: {
        month: data.month,
        budgetGoal: data.budgetGoal,
      },
    });
    res.status(201).json(monthlyExpense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create Expense
app.post("/expenses", async (req: Request, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        monthlyExpenseId: data.monthlyExpenseId,
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get Monthly Expense with Expenses
app.get("/monthly-expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const monthlyExpense = await prisma.monthlyExpense.findUnique({
    where: { id },
    include: { expenses: true },
  });
  if (!monthlyExpense) return res.status(404).json({ error: "Not found" });
  const cashOnHand = monthlyExpense.budgetGoal - monthlyExpense.expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ ...monthlyExpense, cashOnHand });
});

// Update Expense
app.put("/expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = expenseSchema.partial().parse(req.body);
  const expense = await prisma.expense.update({
    where: { id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
  res.json(expense);
});

// Delete Expense
app.delete("/expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

Testing with Jest:
packages/backend/tests/index.test.ts
ts

import supertest from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/index";

const prisma = new PrismaClient();
const request = supertest(app);

describe("Expense API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a monthly expense", async () => {
    const res = await request.post("/monthly-expenses").send({
      month: "2025-03",
      budgetGoal: 1000,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});

packages/backend/jest.config.ts
ts

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
};

Scripts:
packages/backend/package.json
json

{
  "name": "@expense-tracker/backend",
  "version": "0.0.1",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@expense-tracker/common": "^0.0.1",
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.4"
  }
}

Step 5: ESLint and Prettier Config
ESLint Config:
expense-tracker/.eslintrc.json
json

{
  "env": { "node": true, "jest": true },
  "extends": ["airbnb-typescript/base", "prettier"],
  "parserOptions": { "project": "./tsconfig.json" },
  "rules": { "no-console": "warn" }
}

Prettier Config:
expense-tracker/.prettierrc
json

{
  "singleQuote": true,
  "trailingComma": "all"
}

Step 6: GitHub Configuration
GitHub Actions:
expense-tracker/.github/workflows/ci.yml
yaml

name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: "18" }
      - run: npm install
      - run: npx lerna bootstrap
      - run: npx lerna run build
      - run: npx lerna run test
      - run: npx lerna run lint

Dependabot:
expense-tracker/.github/dependabot.yml
yaml

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }

Step 7: Future AWS Serverless Migration
Lambda: Refactor src/index.ts into individual handler functions (e.g., createMonthlyExpense, createExpense).

API Gateway: Map routes to Lambda functions.

Cognito: Add authentication middleware using JWT tokens.

RDS: Use the same PostgreSQL database with Prisma, adjusting the DATABASE_URL.

Step 8: Run the Project
Build and link packages:
bash

npx lerna bootstrap
npx lerna run build

Start the backend:
bash

cd packages/backend
npm start

Test endpoints with a tool like Postman or curl.

This setup meets all your requirements and is modular for future expansion. Let me know if you need help with specific parts or AWS migration details!

