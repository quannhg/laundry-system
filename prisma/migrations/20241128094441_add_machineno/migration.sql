/*
  Warnings:

  - Added the required column `machineNo` to the `WashingMachine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "authCode" TEXT,
ADD COLUMN     "barcode" TEXT;

-- AlterTable
ALTER TABLE "WashingMachine" ADD COLUMN     "machineNo" INTEGER NOT NULL;
