-- AlterTable
ALTER TABLE "Product"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      translate(lower(coalesce("title", '')), 'يك' || E'\u200c', 'یک ')
    )
  ) STORED;

-- CreateIndex
CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");