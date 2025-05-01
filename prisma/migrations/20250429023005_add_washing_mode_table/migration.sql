/*
  Warnings:

  - You are about to drop the column `washingMode` on the `Order` table. All the data in the column will be lost.
  - Added the required column `washingModeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "washingMode",
ADD COLUMN     "washingModeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "WashingMode";

-- CreateTable
CREATE TABLE "WashingMode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WashingMode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WashingMode_name_key" ON "WashingMode"("name");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_washingModeId_fkey" FOREIGN KEY ("washingModeId") REFERENCES "WashingMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
