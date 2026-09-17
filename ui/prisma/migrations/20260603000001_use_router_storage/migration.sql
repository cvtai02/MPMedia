-- Remove storage provider system and switch MediaFile to router-based storage

PRAGMA foreign_keys=OFF;

-- Recreate MediaItem without activeProvider
CREATE TABLE "new_MediaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "checksum" TEXT,
    "status" TEXT NOT NULL,
    "fileTypeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaItem_fileTypeId_fkey" FOREIGN KEY ("fileTypeId") REFERENCES "FileType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MediaItem" ("id", "originalName", "mimeType", "mediaType", "sizeBytes", "checksum", "status", "fileTypeId", "createdAt", "updatedAt")
    SELECT "id", "originalName", "mimeType", "mediaType", "sizeBytes", "checksum", "status", "fileTypeId", "createdAt", "updatedAt" FROM "MediaItem";
DROP TABLE "MediaItem";
ALTER TABLE "new_MediaItem" RENAME TO "MediaItem";

-- Recreate MediaFile with routerPath/cdnUrl instead of provider fields
CREATE TABLE "new_MediaFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaItemId" TEXT NOT NULL,
    "routerPath" TEXT NOT NULL DEFAULT '',
    "cdnUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isCached" BOOLEAN NOT NULL DEFAULT false,
    "localCachePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaFile_mediaItemId_fkey" FOREIGN KEY ("mediaItemId") REFERENCES "MediaItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "MediaFile";
ALTER TABLE "new_MediaFile" RENAME TO "MediaFile";

-- Drop storage provider table
DROP TABLE IF EXISTS "StorageProviderSetting";

PRAGMA foreign_keys=ON;
