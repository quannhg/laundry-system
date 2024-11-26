/*
  Warnings:

  - The values [SOAK] on the enum `WashingMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WashingMode_new" AS ENUM ('NORMAL', 'THOROUGHLY');
ALTER TABLE "Order" ALTER COLUMN "washingMode" TYPE "WashingMode_new" USING ("washingMode"::text::"WashingMode_new");
ALTER TYPE "WashingMode" RENAME TO "WashingMode_old";
ALTER TYPE "WashingMode_new" RENAME TO "WashingMode";
DROP TYPE "WashingMode_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isSoak" BOOLEAN DEFAULT false,
ADD COLUMN     "price" INTEGER;
