-- Create Company table if missing
CREATE TABLE IF NOT EXISTS "Company" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add companyId column to Worker if missing (nullable to avoid breaking existing rows)
ALTER TABLE "Worker"
ADD COLUMN IF NOT EXISTS "companyId" INTEGER;

-- Index for filtering
CREATE INDEX IF NOT EXISTS "Worker_companyId_idx" ON "Worker"("companyId");

-- Add FK if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Worker_companyId_fkey'
  ) THEN
    ALTER TABLE "Worker"
    ADD CONSTRAINT "Worker_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
