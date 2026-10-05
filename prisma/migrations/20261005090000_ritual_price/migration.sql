-- Optional price override for a featured ritual (null = use the treatment's menu price).
ALTER TABLE "RitualPick" ADD COLUMN "price" INTEGER;
