/*
  Warnings:

  - You are about to drop the column `vehicleNo` on the `booking` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to drop the column `commission` on the `ownerinvoice` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ownerinvoice` table. All the data in the column will be lost.
  - You are about to drop the column `netPayout` on the `ownerinvoice` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ownerinvoice` table. All the data in the column will be lost.
  - You are about to alter the column `month` on the `ownerinvoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `documentId` on the `ownerprofile` table. All the data in the column will be lost.
  - You are about to drop the column `documentUrl` on the `ownerprofile` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `ownerprofile` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(1))`.
  - You are about to drop the `invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ownerkyc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parkingsetup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supportticket` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `OwnerInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFee` to the `OwnerInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `OwnerInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `ownerinvoice` DROP FOREIGN KEY `OwnerInvoice_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `ownerkyc` DROP FOREIGN KEY `OwnerKYC_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `ownerprofile` DROP FOREIGN KEY `OwnerProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `parkingsetup` DROP FOREIGN KEY `ParkingSetup_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `staff` DROP FOREIGN KEY `Staff_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `supportticket` DROP FOREIGN KEY `SupportTicket_ownerId_fkey`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `vehicleNo`,
    ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    ADD COLUMN `vehicleType` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE `ownerinvoice` DROP COLUMN `commission`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `netPayout`,
    DROP COLUMN `status`,
    ADD COLUMN `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `netAmount` DOUBLE NOT NULL,
    ADD COLUMN `pdfUrl` VARCHAR(191) NULL,
    ADD COLUMN `platformFee` DOUBLE NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL,
    MODIFY `month` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ownerprofile` DROP COLUMN `documentId`,
    DROP COLUMN `documentUrl`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    MODIFY `status` ENUM('OWNER_ONBOARDING', 'KYC_PENDING', 'KYC_REJECTED', 'APPROVED', 'SUSPENDED') NOT NULL DEFAULT 'OWNER_ONBOARDING';

-- DropTable
DROP TABLE `invoice`;

-- DropTable
DROP TABLE `ownerkyc`;

-- DropTable
DROP TABLE `parkingsetup`;

-- DropTable
DROP TABLE `staff`;

-- DropTable
DROP TABLE `supportticket`;

-- CreateTable
CREATE TABLE `OwnerVerification` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedByAdmin` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `rejectionReason` VARCHAR(191) NULL,

    UNIQUE INDEX `OwnerVerification_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerSettlement` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `settledAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerIncident` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerMaintenance` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerStaff` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('SCANNER', 'MANAGER') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerSupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParkingSetupProgress` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `locationDone` BOOLEAN NOT NULL DEFAULT false,
    `slotsDone` BOOLEAN NOT NULL DEFAULT false,
    `pricingDone` BOOLEAN NOT NULL DEFAULT false,
    `amenitiesDone` BOOLEAN NOT NULL DEFAULT false,
    `submitted` BOOLEAN NOT NULL DEFAULT false,
    `lastStep` VARCHAR(191) NULL,

    UNIQUE INDEX `ParkingSetupProgress_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OwnerProfile` ADD CONSTRAINT `OwnerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerVerification` ADD CONSTRAINT `OwnerVerification_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_parkingLotId_fkey` FOREIGN KEY (`parkingLotId`) REFERENCES `ParkingLot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerInvoice` ADD CONSTRAINT `OwnerInvoice_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerSettlement` ADD CONSTRAINT `OwnerSettlement_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerIncident` ADD CONSTRAINT `OwnerIncident_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerMaintenance` ADD CONSTRAINT `OwnerMaintenance_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerStaff` ADD CONSTRAINT `OwnerStaff_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerSupportTicket` ADD CONSTRAINT `OwnerSupportTicket_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParkingSetupProgress` ADD CONSTRAINT `ParkingSetupProgress_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `OwnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
