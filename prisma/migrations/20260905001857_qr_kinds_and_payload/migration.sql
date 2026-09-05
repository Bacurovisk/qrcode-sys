-- CreateEnum
CREATE TYPE "QrKind" AS ENUM ('URL', 'TEXT', 'CONTACT', 'SOCIAL', 'APP', 'LOCATION', 'SMS', 'EMAIL', 'PHONE', 'WIFI', 'PIX');

-- AlterTable: add the new columns first (payload nullable for now)
ALTER TABLE "QrCode" ADD COLUMN "kind" "QrKind" NOT NULL DEFAULT 'URL';
ALTER TABLE "QrCode" ADD COLUMN "payload" JSONB;

-- Backfill existing rows (all pre-existing QR codes are kind=URL, whose
-- content lived in "targetUrl") before dropping that column.
UPDATE "QrCode" SET "payload" = jsonb_build_object('url', "targetUrl") WHERE "payload" IS NULL;

-- Now that every row has a payload, enforce NOT NULL and drop the old column.
ALTER TABLE "QrCode" ALTER COLUMN "payload" SET NOT NULL;
ALTER TABLE "QrCode" DROP COLUMN "targetUrl";
