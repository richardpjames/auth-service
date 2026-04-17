-- AlterTable
ALTER TABLE "AuthCode" ADD COLUMN     "codeChallenge" TEXT,
ADD COLUMN     "codeChallengeMethod" TEXT;

-- AlterTable
ALTER TABLE "ClientApp" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
