-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "openStrategy" TEXT NOT NULL DEFAULT 'download',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FileType" ("createdAt", "id", "name", "order", "updatedAt") SELECT "createdAt", "id", "name", "order", "updatedAt" FROM "FileType";
DROP TABLE "FileType";
ALTER TABLE "new_FileType" RENAME TO "FileType";
CREATE UNIQUE INDEX "FileType_name_key" ON "FileType"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
