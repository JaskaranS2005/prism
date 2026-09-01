-- CreateTable
CREATE TABLE "public"."AdministrativeAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stateId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdministrativeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeAssignment_userId_key" ON "public"."AdministrativeAssignment"("userId");

-- CreateIndex
CREATE INDEX "AdministrativeAssignment_stateId_idx" ON "public"."AdministrativeAssignment"("stateId");

-- CreateIndex
CREATE INDEX "AdministrativeAssignment_districtId_idx" ON "public"."AdministrativeAssignment"("districtId");

-- CreateIndex
CREATE INDEX "AdministrativeAssignment_municipalityId_idx" ON "public"."AdministrativeAssignment"("municipalityId");

-- CreateIndex
CREATE INDEX "AdministrativeAssignment_departmentId_idx" ON "public"."AdministrativeAssignment"("departmentId");

-- AddForeignKey
ALTER TABLE "public"."AdministrativeAssignment" ADD CONSTRAINT "AdministrativeAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdministrativeAssignment" ADD CONSTRAINT "AdministrativeAssignment_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdministrativeAssignment" ADD CONSTRAINT "AdministrativeAssignment_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "public"."District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdministrativeAssignment" ADD CONSTRAINT "AdministrativeAssignment_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "public"."Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdministrativeAssignment" ADD CONSTRAINT "AdministrativeAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
