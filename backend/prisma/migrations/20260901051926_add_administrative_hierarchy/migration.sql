/*
  Warnings:

  - A unique constraint covering the columns `[municipalityId,name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Department_name_key";

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "municipalityId" TEXT;

-- CreateTable
CREATE TABLE "public"."State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Municipality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "public"."State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "public"."State"("code");

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "public"."District"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "District_stateId_name_key" ON "public"."District"("stateId", "name");

-- CreateIndex
CREATE INDEX "Municipality_districtId_idx" ON "public"."Municipality"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_districtId_name_key" ON "public"."Municipality"("districtId", "name");

-- CreateIndex
CREATE INDEX "Department_municipalityId_idx" ON "public"."Department"("municipalityId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_municipalityId_name_key" ON "public"."Department"("municipalityId", "name");

-- AddForeignKey
ALTER TABLE "public"."District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Municipality" ADD CONSTRAINT "Municipality_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "public"."District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "public"."Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
