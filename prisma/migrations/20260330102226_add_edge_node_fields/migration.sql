/*
  Warnings:

  - A unique constraint covering the columns `[edgeNodeId]` on the table `parkinglot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[edgeToken]` on the table `parkinglot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `parkinglot` ADD COLUMN `ddnsDomain` VARCHAR(191) NULL,
    ADD COLUMN `edgeNodeId` VARCHAR(191) NULL,
    ADD COLUMN `edgeToken` VARCHAR(191) NULL,
    ADD COLUMN `lastHeartbeat` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `passwordresettoken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `passwordresettoken_token_key`(`token`),
    INDEX `passwordresettoken_email_idx`(`email`),
    INDEX `passwordresettoken_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `parkinglot_edgeNodeId_key` ON `parkinglot`(`edgeNodeId`);

-- CreateIndex
CREATE UNIQUE INDEX `parkinglot_edgeToken_key` ON `parkinglot`(`edgeToken`);
