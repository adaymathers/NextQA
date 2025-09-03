-- DropForeignKey
ALTER TABLE "ProductionLine" DROP CONSTRAINT "ProductionLine_projectId_fkey";

-- AlterTable
ALTER TABLE "ProductionLine" ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductionLine" ADD CONSTRAINT "ProductionLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
