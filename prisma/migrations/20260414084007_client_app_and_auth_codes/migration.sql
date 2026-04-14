-- CreateTable
CREATE TABLE "ClientApp" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,

    CONSTRAINT "ClientApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientAppId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientApp_clientId_key" ON "ClientApp"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthCode_code_key" ON "AuthCode"("code");

-- CreateIndex
CREATE INDEX "AuthCode_userId_idx" ON "AuthCode"("userId");

-- CreateIndex
CREATE INDEX "AuthCode_clientAppId_idx" ON "AuthCode"("clientAppId");

-- CreateIndex
CREATE INDEX "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");

-- AddForeignKey
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_clientAppId_fkey" FOREIGN KEY ("clientAppId") REFERENCES "ClientApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
