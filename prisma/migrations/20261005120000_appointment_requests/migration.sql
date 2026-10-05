-- Website appointment requests may leave the stylist open ("any available stylist").
-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "stylistId" DROP NOT NULL;

