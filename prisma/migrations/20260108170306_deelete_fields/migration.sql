/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `WorkTime` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Worker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkTime" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "updatedAt";
