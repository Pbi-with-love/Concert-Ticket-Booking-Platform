-- DropIndex
DROP INDEX "TicketCategory_concertId_idx";

-- CreateIndex
CREATE INDEX "TicketCategory_concertId_name_idx" ON "TicketCategory"("concertId", "name");
