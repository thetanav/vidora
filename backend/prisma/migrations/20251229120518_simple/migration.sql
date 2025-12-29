/*
  Warnings:

  - You are about to drop the column `channelId` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserSubscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_channelId_fkey";

-- DropForeignKey
ALTER TABLE "_UserSubscriptions" DROP CONSTRAINT "_UserSubscriptions_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserSubscriptions" DROP CONSTRAINT "_UserSubscriptions_B_fkey";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "channelId";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_UserSubscriptions";
