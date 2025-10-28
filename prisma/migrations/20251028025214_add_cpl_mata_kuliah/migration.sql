-- AlterTable
ALTER TABLE "cpl" ADD COLUMN     "mata_kuliah_id" INTEGER;

-- AddForeignKey
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
