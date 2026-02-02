-- AlterTable
ALTER TABLE `pricingrule` ADD COLUMN `currentPrice` DOUBLE NULL,
    ADD COLUMN `lastUpdated` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `preferredCurrency` VARCHAR(191) NOT NULL DEFAULT 'USD';

-- CreateTable
CREATE TABLE `subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `stripeSubscriptionId` VARCHAR(191) NOT NULL,
    `plan` ENUM('MONTHLY_RESERVED', 'CORPORATE', 'OWNER_FLEET', 'CUSTOM') NOT NULL,
    `status` ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING') NOT NULL DEFAULT 'ACTIVE',
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_stripeSubscriptionId_key`(`stripeSubscriptionId`),
    INDEX `subscription_userId_idx`(`userId`),
    INDEX `subscription_stripeSubscriptionId_idx`(`stripeSubscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `radiusKm` DOUBLE NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `surgeMultiplier` DOUBLE NOT NULL DEFAULT 1.3,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `event_startTime_idx`(`startTime`),
    INDEX `event_endTime_idx`(`endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchangerate` (
    `id` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `rateToUSD` DOUBLE NOT NULL,
    `lastUpdated` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `exchangerate_currency_key`(`currency`),
    INDEX `exchangerate_currency_idx`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `priceaudit` (
    `id` VARCHAR(191) NOT NULL,
    `parkingLotId` VARCHAR(191) NOT NULL,
    `oldPrice` DOUBLE NOT NULL,
    `newPrice` DOUBLE NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `triggeredBy` VARCHAR(191) NULL,
    `eventId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `priceaudit_parkingLotId_idx`(`parkingLotId`),
    INDEX `priceaudit_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `priceaudit` ADD CONSTRAINT `priceaudit_parkingLotId_fkey` FOREIGN KEY (`parkingLotId`) REFERENCES `parkinglot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
