/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Complaint_createdById_idx" ON "public"."Complaint"("createdById");

-- CreateIndex
CREATE INDEX "Complaint_departmentId_idx" ON "public"."Complaint"("departmentId");

-- CreateIndex
CREATE INDEX "Complaint_assignedOfficerId_idx" ON "public"."Complaint"("assignedOfficerId");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "public"."Complaint"("status");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "public"."User"("roleId");
