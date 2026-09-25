-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('LEAD_CREATED', 'LEAD_UPDATED', 'STATUS_CHANGED');

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "adId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_status_createdAt_idx" ON "lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "lead_adId_idx" ON "lead"("adId");

-- CreateIndex
CREATE INDEX "activity_leadId_createdAt_idx" ON "activity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_action_createdAt_idx" ON "activity"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
