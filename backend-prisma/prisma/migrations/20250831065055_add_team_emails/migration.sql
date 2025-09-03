-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "emails" TEXT[] DEFAULT ARRAY[]::TEXT[];
