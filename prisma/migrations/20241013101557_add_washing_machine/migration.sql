-- CreateEnum
CREATE TYPE "LaundryStatus" AS ENUM ('IDLE', 'WASHING', 'DRYING');

-- CreateTable
CREATE TABLE "WashingMachine" (
    "id" TEXT NOT NULL,
    "status" "LaundryStatus" NOT NULL,

    CONSTRAINT "WashingMachine_pkey" PRIMARY KEY ("id")
);
