/*
  Warnings:

  - You are about to drop the column `active` on the `staff` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `staff` table. All the data in the column will be lost.
  - Made the column `email` on table `staff` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `staff` DROP FOREIGN KEY `Staff_ownerId_fkey`;

-- AlterTable
ALTER TABLE `staff` DROP COLUMN `active`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `email` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Staff` ADD CONSTRAINT `Staff_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
