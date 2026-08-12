-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ComplaintStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "public"."ComplaintStatus" ADD VALUE 'REOPENED';

-- CreateTable
CREATE TABLE "public"."ComplaintStatusHistory" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "status" "public"."ComplaintStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "reason" TEXT,
    "resolutionNote" TEXT,
    "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_complaintId_idx" ON "public"."ComplaintStatusHistory"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_changedById_idx" ON "public"."ComplaintStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_status_idx" ON "public"."ComplaintStatusHistory"("status");

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_complaintId_cycleNumber_idx" ON "public"."ComplaintStatusHistory"("complaintId", "cycleNumber");

-- AddForeignKey
ALTER TABLE "public"."ComplaintStatusHistory" ADD CONSTRAINT "ComplaintStatusHistory_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplaintStatusHistory" ADD CONSTRAINT "ComplaintStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
