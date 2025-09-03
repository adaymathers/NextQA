/*
  Warnings:

  - You are about to drop the column `projectId` on the `ProductionLine` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductionLine" DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emails" TEXT[],

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
