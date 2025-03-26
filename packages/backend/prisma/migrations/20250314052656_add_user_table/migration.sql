/*
  Warnings:

  - Added the required column `category` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedAt` to the `MonthlyExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MonthlyExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MonthlyExpense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRANSPORTATION', 'GROCERY', 'SCHOOL', 'CAR', 'HOUSE', 'TRAVEL', 'PERSONAL', 'KIDS', 'MISCELLANEOUS');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "category" "ExpenseCategory" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MonthlyExpense" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "month" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- AddForeignKey
ALTER TABLE "MonthlyExpense" ADD CONSTRAINT "MonthlyExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
