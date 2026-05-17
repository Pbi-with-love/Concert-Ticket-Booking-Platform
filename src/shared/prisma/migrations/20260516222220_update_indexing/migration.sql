-- CreateIndex
CREATE INDEX "Concert_startTime_id_idx" ON "Concert"("startTime", "id");

-- CreateIndex
CREATE INDEX "Concert_status_startTime_idx" ON "Concert"("status", "startTime");

-- CreateIndex
CREATE INDEX "TicketCategory_concertId_idx" ON "TicketCategory"("concertId");
