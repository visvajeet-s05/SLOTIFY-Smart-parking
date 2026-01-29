/*
  Warnings:

  - You are about to drop the column `endTime` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `booking` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(9))` to `VarChar(191)`.
  - You are about to drop the column `isActive` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `kycStatus` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleNo` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `endTime`,
    DROP COLUMN `slotId`,
    DROP COLUMN `startTime`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `vehicleNo` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `isActive`,
    DROP COLUMN `kycStatus`,
    DROP COLUMN `ownerId`,
    DROP COLUMN `updatedAt`;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `licensePlate` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
