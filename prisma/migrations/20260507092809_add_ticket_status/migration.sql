-- CreateEnum
CREATE TYPE "ticket_status_enum" AS ENUM ('UNUSED', 'CHECKED_IN', 'REVOKED');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "status" "ticket_status_enum" DEFAULT 'UNUSED';
