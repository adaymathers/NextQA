-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
