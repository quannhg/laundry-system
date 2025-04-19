-- CreateTable
CREATE TABLE "PowerUsageData" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "totalKwh" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PowerUsageData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PowerUsageData_orderId_key" ON "PowerUsageData"("orderId");

-- AddForeignKey
ALTER TABLE "PowerUsageData" ADD CONSTRAINT "PowerUsageData_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerUsageData" ADD CONSTRAINT "PowerUsageData_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "WashingMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
