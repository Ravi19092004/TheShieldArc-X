-- AlterTable
ALTER TABLE "TwoFactorConfirmation" ADD COLUMN     "code" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL DEFAULT 'phishing',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatFeed" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreatFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentalControl" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "blocklist" TEXT[],
    "timeLimits" JSONB,
    "safeBrowsing" BOOLEAN NOT NULL DEFAULT true,
    "contentFiltering" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentalControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyScore" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "trackers" TEXT[],
    "cookies" TEXT[],
    "lastScannedAt" TIMESTAMP(3) NOT NULL,
    "nextScanAt" TIMESTAMP(3),

    CONSTRAINT "PrivacyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCheckup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCheckup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyLockerItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyLockerItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_userId_idx" ON "Achievement"("userId");

-- CreateIndex
CREATE INDEX "ThreatReport_userId_idx" ON "ThreatReport"("userId");

-- CreateIndex
CREATE INDEX "ThreatReport_status_idx" ON "ThreatReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatFeed_url_key" ON "ThreatFeed"("url");

-- CreateIndex
CREATE INDEX "ThreatFeed_publishedAt_idx" ON "ThreatFeed"("publishedAt");

-- CreateIndex
CREATE INDEX "ThreatFeed_category_idx" ON "ThreatFeed"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ParentalControl_userId_key" ON "ParentalControl"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyScore_url_key" ON "PrivacyScore"("url");

-- CreateIndex
CREATE INDEX "PrivacyScore_domain_idx" ON "PrivacyScore"("domain");

-- CreateIndex
CREATE INDEX "ScheduledCheckup_userId_idx" ON "ScheduledCheckup"("userId");

-- CreateIndex
CREATE INDEX "ScheduledCheckup_nextRunAt_idx" ON "ScheduledCheckup"("nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDevice_deviceId_key" ON "SecurityDevice"("deviceId");

-- CreateIndex
CREATE INDEX "SecurityDevice_userId_idx" ON "SecurityDevice"("userId");

-- CreateIndex
CREATE INDEX "SecurityDevice_type_idx" ON "SecurityDevice"("type");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "PrivacyLockerItem_userId_idx" ON "PrivacyLockerItem"("userId");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatReport" ADD CONSTRAINT "ThreatReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalControl" ADD CONSTRAINT "ParentalControl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCheckup" ADD CONSTRAINT "ScheduledCheckup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDevice" ADD CONSTRAINT "SecurityDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacyLockerItem" ADD CONSTRAINT "PrivacyLockerItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
