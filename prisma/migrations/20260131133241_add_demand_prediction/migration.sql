-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastLoginAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `DemandPrediction` (
    `id` VARCHAR(191) NOT NULL,
    `parkingId` VARCHAR(191) NOT NULL,
    `hour` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `demandScore` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
