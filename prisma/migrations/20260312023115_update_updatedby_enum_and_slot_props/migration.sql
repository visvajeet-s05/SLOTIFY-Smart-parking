-- AlterTable
ALTER TABLE `booking` ADD COLUMN `slotId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `parkinglot` ADD COLUMN `cameraUrl` VARCHAR(191) NULL,
    ADD COLUMN `totalSlots` INTEGER NOT NULL DEFAULT 120;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `walletBalance` DOUBLE NOT NULL DEFAULT 0.0,
    MODIFY `preferredCurrency` VARCHAR(191) NOT NULL DEFAULT 'INR';

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `Fastag` (
    `id` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0.0,
    `status` ENUM('ACTIVE', 'BLOCKED', 'BLACKLISTED', 'LOW_BALANCE') NOT NULL DEFAULT 'ACTIVE',
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Fastag_tagId_key`(`tagId`),
    UNIQUE INDEX `Fastag_vehicleId_key`(`vehicleId`),
    INDEX `Fastag_userId_idx`(`userId`),
    INDEX `Fastag_vehicleId_idx`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Camera` (
    `id` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Camera_lotId_idx`(`lotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slot` (
    `id` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NOT NULL,
    `cameraId` VARCHAR(191) NULL,
    `slotNumber` INTEGER NOT NULL,
    `row` VARCHAR(191) NOT NULL,
    `x` INTEGER NULL,
    `y` INTEGER NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED', 'CLOSED') NOT NULL DEFAULT 'AVAILABLE',
    `aiConfidence` DOUBLE NOT NULL DEFAULT 100.0,
    `updatedBy` ENUM('AI', 'OWNER', 'CUSTOMER', 'SYSTEM', 'BOOKING') NOT NULL DEFAULT 'AI',
    `updatedAt` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 50.0,
    `slotType` VARCHAR(191) NOT NULL DEFAULT 'REGULAR',
    `displayName` VARCHAR(191) NULL,

    INDEX `Slot_lotId_idx`(`lotId`),
    INDEX `Slot_cameraId_idx`(`cameraId`),
    INDEX `Slot_status_idx`(`status`),
    UNIQUE INDEX `Slot_lotId_slotNumber_key`(`lotId`, `slotNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SlotStatusLog` (
    `id` VARCHAR(191) NOT NULL,
    `slotId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED', 'CLOSED') NOT NULL,
    `newStatus` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED', 'CLOSED') NOT NULL,
    `updatedBy` ENUM('AI', 'OWNER', 'CUSTOMER', 'SYSTEM', 'BOOKING') NOT NULL,
    `aiConfidence` DOUBLE NOT NULL DEFAULT 100.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SlotStatusLog_slotId_idx`(`slotId`),
    INDEX `SlotStatusLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `booking_slotId_idx` ON `booking`(`slotId`);

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `Slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fastag` ADD CONSTRAINT `Fastag_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fastag` ADD CONSTRAINT `Fastag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Camera` ADD CONSTRAINT `Camera_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `parkinglot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `parkinglot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_cameraId_fkey` FOREIGN KEY (`cameraId`) REFERENCES `Camera`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
