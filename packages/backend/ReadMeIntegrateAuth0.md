Integrating Auth0 into your existing Express.js and Prisma backend is a great way to add robust authentication and authorization without building it from scratch. Below, I’ll guide you through integrating Auth0 into the expense-tracker project we’ve been working on. We’ll use Auth0 for user authentication, secure the API routes, and associate Auth0 users with your Prisma User model. This setup will also align with your future plans for AWS Cognito, as both are OAuth-based systems.
Step 1: Set Up Auth0
Create an Auth0 Account:
Sign up at auth0.com if you haven’t already.

Create an Application:
In the Auth0 Dashboard, go to Applications > Applications and click Create Application.

Choose Regular Web Application (we’ll adjust for API later).

Note down the Domain, Client ID, and Client Secret from the Settings tab.

Create an API:
Go to Applications > APIs and click Create API.

Name it (e.g., Expense Tracker API), set an Identifier (e.g., https://expense-tracker-api), and keep the signing algorithm as RS256.

Save the Identifier (this is the audience).

Configure Callbacks and URLs:
In your Auth0 Application’s Settings:
Allowed Callback URLs: http://localhost:3000/api/auth/callback

Allowed Logout URLs: http://localhost:3000

Allowed Web Origins: http://localhost:3000

Save changes.

Step 2: Update Project Dependencies
Add the necessary packages for Auth0 integration:
bash

cd packages/backend
pnpm add express-oauth2-jwt-bearer dotenv
pnpm add -D @types/express-oauth2-jwt-bearer

express-oauth2-jwt-bearer: Middleware to validate Auth0 JWTs.

dotenv: To manage environment variables.

Step 3: Configure Environment Variables
Update packages/backend/.env:

DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"
PORT=3000
AUTH0_DOMAIN=your-auth0-domain.auth0.com  # e.g., dev-xxxxx.us.auth0.com
AUTH0_AUDIENCE=https://expense-tracker-api  # From API Identifier

Load these in index.ts using dotenv:
ts

import dotenv from "dotenv";
dotenv.config();

Step 4: Update Prisma Schema for Auth0
Modify prisma/schema.prisma to link Auth0 users to your database:
prisma

model User {
  id            String          @id @default(uuid())
  auth0Id       String          @unique // Auth0 subject (sub) claim
  email         String          @unique
  monthlyExpenses MonthlyExpense[]
  createdAt     DateTime        @default(now())
}

model MonthlyExpense {
  id         String    @id @default(uuid())
  month      String
  budgetGoal Float
  expenses   Expense[]
  user       User      @relation(fields: [userId], references: [id])
  userId     String
}

model Expense {
  id              String        @id @default(uuid())
  description     String
  amount          Float
  date            DateTime
  monthlyExpense  MonthlyExpense @relation(fields: [monthlyExpenseId], references: [id])
  monthlyExpenseId String
}

Run the migration:
bash

npx prisma migrate dev --name add_auth0_id

Step 5: Secure Routes with Auth0 Middleware
Update packages/backend/src/index.ts to include Auth0 JWT validation:
ts

import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Auth0 JWT middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

app.use(limiter);
app.use(express.json());

// Secure static files
app.use(
  "/static",
  express.static(path.join(__dirname, "../public"), {
    dotfiles: "deny",
    index: false,
    redirect: false,
  }),
);
app.use("/static/*", (req: express.Request, res: express.Response) => {
  res.status(403).send("Access denied");
});

// Apply JWT middleware to API routes
app.use("/api", checkJwt, routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

Step 6: Update Routes with User Context
Modify packages/backend/src/routes.ts to use the authenticated user’s sub (Auth0 ID) and sync with Prisma:
ts

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { expenseSchema, monthlyExpenseSchema } from "@expense-tracker/common";
import { z } from "zod";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

// Middleware to sync Auth0 user with Prisma
const syncUser = async (req: Request, res: Response, next: Function) => {
  const auth0Id = (req as any).auth.sub; // Auth0 subject (sub) claim
  let user = await prisma.user.findUnique({ where: { auth0Id } });

  if (!user) {
    // Create user if not exists
    user = await prisma.user.create({
      data: {
        auth0Id,
        email: (req as any).auth.payload.email || `${auth0Id}@example.com`, // Fallback email
      },
    });
  }

  (req as any).user = user; // Attach user to request
  next();
};

// Apply syncUser to all routes
router.use(syncUser);

// User Registration (optional, Auth0 handles this, but for demo)
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = userSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        auth0Id: "local|" + data.email, // For local users, replace with Auth0 flow
      },
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create Monthly Expense
router.post("/monthly-expenses", async (req: Request, res: Response) => {
  try {
    const data = monthlyExpenseSchema.parse(req.body);
    const userId = (req as any).user.id;
    const monthlyExpense = await prisma.monthlyExpense.create({
      data: {
        month: data.month,
        budgetGoal: data.budgetGoal,
        userId,
      },
    });
    res.status(201).json(monthlyExpense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create Expense
router.post("/expenses", async (req: Request, res: Response) => {
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
router.get("/monthly-expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const monthlyExpense = await prisma.monthlyExpense.findFirst({
    where: { id, userId },
    include: { expenses: true },
  });
  if (!monthlyExpense) return res.status(404).json({ error: "Not found" });
  const cashOnHand = monthlyExpense.budgetGoal - monthlyExpense.expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ ...monthlyExpense, cashOnHand });
});

// Update Expense
router.put("/expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = expenseSchema.partial().parse(req.body);
  const expense = await prisma.expense.update({
    where: { id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
  res.json(expense);
});

// Delete Expense
router.delete("/expenses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

export default router;

Step 7: Test the Integration
Run the Backend:
bash

pnpm install
pnpm build
cd packages/backend
pnpm start

Get an Access Token:
Use the Auth0 Dashboard’s Test tab for your API to get a token manually, or implement a frontend (e.g., with auth0-spa-js) to handle login and callback.

For testing, use a tool like Postman:
Set Authorization header to Bearer <token>.

Call http://localhost:3000/api/monthly-expenses.

Verify:
Unauthenticated requests should return a 401 error.

Authenticated requests should create and retrieve data tied to the Auth0 user.

Notes for AWS Migration
Cognito: Replace express-oauth2-jwt-bearer with AWS SDK middleware for Cognito JWT validation.

Lambda: Split routes.ts into individual handler functions.

API Gateway: Map routes to Lambda functions with Cognito authorizers.

Optional: Frontend Integration
For a complete flow, you’d need a frontend to handle login/logout. Using auth0-spa-js:
bash

pnpm add @auth0/auth0-spa-js

Example frontend code (simplified):
ts

import createAuth0Client from "@auth0/auth0-spa-js";

const auth0 = await createAuth0Client({
  domain: "your-auth0-domain.auth0.com",
  client_id: "your-client-id",
  redirect_uri: "http://localhost:3000/api/auth/callback",
  audience: "https://expense-tracker-api",
});

await auth0.loginWithRedirect();
// On callback page:
const token = await auth0.getTokenSilently();
fetch("http://localhost:3000/api/monthly-expenses", {
  headers: { Authorization: `Bearer ${token}` },
});

This integrates Auth0 seamlessly into your backend, securing routes and syncing users with Prisma. Let me know if you need help with the frontend or further refinements!

