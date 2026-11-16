-- CreateTable
CREATE TABLE "StorageObject" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "referenceCount" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT,
    "size" INTEGER,
    "unreferencedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageObject_key_key" ON "StorageObject"("key");

-- CreateIndex
CREATE INDEX "StorageObject_referenceCount_unreferencedAt_idx" ON "StorageObject"("referenceCount", "unreferencedAt");
