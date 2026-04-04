-- CreateIndex
CREATE INDEX "BankStatement_createdAt_idx" ON "BankStatement"("createdAt");

-- CreateIndex
CREATE INDEX "Contribution_memberId_contributionDate_idx" ON "Contribution"("memberId", "contributionDate");

-- CreateIndex
CREATE INDEX "Contribution_createdAt_idx" ON "Contribution"("createdAt");

-- CreateIndex
CREATE INDEX "EmergencyRequest_memberId_requestDate_idx" ON "EmergencyRequest"("memberId", "requestDate");

-- CreateIndex
CREATE INDEX "EmergencyRequest_status_requestDate_idx" ON "EmergencyRequest"("status", "requestDate");

-- CreateIndex
CREATE INDEX "GoverningDocument_isActive_createdAt_idx" ON "GoverningDocument"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_userId_expires_idx" ON "Session"("userId", "expires");

-- CreateIndex
CREATE INDEX "Transaction_memberId_type_eventDate_idx" ON "Transaction"("memberId", "type", "eventDate");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_name_idx" ON "User"("role", "name");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "Withdrawal_memberId_withdrawalDate_idx" ON "Withdrawal"("memberId", "withdrawalDate");

-- CreateIndex
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
