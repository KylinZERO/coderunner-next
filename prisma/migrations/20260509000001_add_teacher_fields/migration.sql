-- AlterTable
ALTER TABLE "Problem" ADD COLUMN "tags" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "feedback" TEXT;
ALTER TABLE "Submission" ADD COLUMN "reviewedBy" INTEGER;
