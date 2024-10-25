/*
  Warnings:

  - You are about to drop the column `released_at` on the `game` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `steam_id` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_google_id_key";

-- DropIndex
DROP INDEX "user_steam_id_key";

-- AlterTable
ALTER TABLE "game" DROP COLUMN "released_at";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "google_id",
DROP COLUMN "steam_id";
