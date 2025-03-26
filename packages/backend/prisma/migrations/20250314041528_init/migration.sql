-- CreateTable
CREATE TABLE "MonthlyExpense" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "budgetGoal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MonthlyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "monthlyExpenseId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_monthlyExpenseId_fkey" FOREIGN KEY ("monthlyExpenseId") REFERENCES "MonthlyExpense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
