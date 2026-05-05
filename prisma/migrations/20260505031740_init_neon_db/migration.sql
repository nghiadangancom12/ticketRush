/*
  Warnings:

  - Added the required column `event_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "event_status_enum" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "event_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN     "password_changed_at" TIMESTAMPTZ(6),
ADD COLUMN     "password_reset_expires" TIMESTAMPTZ(6),
ADD COLUMN     "password_reset_token" VARCHAR(255);

-- CreateIndex
CREATE INDEX "idx_orders_event" ON "orders"("event_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
