/*
  Warnings:

  - You are about to drop the column `barcode` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "barcode";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enableNotification" BOOLEAN NOT NULL DEFAULT true;
