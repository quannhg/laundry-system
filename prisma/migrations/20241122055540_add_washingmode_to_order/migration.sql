/*
  Warnings:

  - Added the required column `washingMode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WashingMode" AS ENUM ('NORMAL', 'THOROUGHLY', 'SOAK');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "washingMode" "WashingMode" NOT NULL;
