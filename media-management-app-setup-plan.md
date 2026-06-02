# Media Management App Setup Plan

## 1. Project Goal

Build a media management application for:

- Uploading media
- Caching media on local disk
- Downloading media
- Labeling media
- Backing up media
- Switching storage infrastructure at runtime

Supported infrastructure:

- Cloudflare R2
- Google Drive
- Local disk storage

Supported media types:

- Images
- Videos
- Audio
- Documents
- Archives
- Any other file type

## 2. Selected Stack

### Backend

- NestJS
- Prisma ORM
- SQLite for development
- PostgreSQL for production

### Frontend

- Next.js

### Authentication

- Multi-admin only
- No customer/user role needed initially
- Admin accounts can manage media, labels, settings, storage providers, and backup jobs

### Storage Providers

- Cloudflare R2
- Google Drive
- Local disk

Storage providers must be switchable through runtime settings stored in the database.

## 3. Required Root Structure

```text
project/
├── app/                # NestJS backend application
├── ui/                 # Next.js frontend application
├── api-clients/        # Reusable TypeScript API SDK
├── api-mcp-server/     # Internal tooling, smoke tests, maintenance scripts
├── handoffs/           # Backend/UI coordination documents
├── agents/             # AI agent instructions
├── index.md            # Root folder index
└── rules.md            # Global project rules
```

## 4. Global Architecture Rules

- Use Domain-Driven Design.
- No repository layer.
- Prisma is the persistence core.
- Use Cases may access Prisma directly.
- API controllers must call Use Cases only.
- API controllers must not access Infrastructure directly.
- Infrastructure must not contain business logic.
- Infrastructure implements Core contracts only when real separation is needed.
- Runtime settings must be stored in the database.
- No `.env` file should be required.
- Settings must be editable from the UI.
- Settings must be loaded on startup and after changes.
- Generated code must be split into small, searchable files.
- Avoid large monolithic files.
- If code is duplicated twice, modularize it.

## 5. Backend App Structure

```text
app/
├── src/
│   ├── core/
│   │   ├── media/
│   │   ├── labels/
│   │   ├── storage/
│   │   ├── backups/
│   │   ├── admins/
│   │   ├── settings/
│   │   ├── index.md
│   │   └── rules.md
│   │
│   ├── modules/
│   │   ├── media/
│   │   ├── labels/
│   │   ├── storage/
│   │   ├── backups/
│   │   ├── admins/
│   │   ├── settings/
│   │   ├── index.md
│   │   └── rules.md
│   │
│   ├── api/
│   │   ├── media/
│   │   ├── labels/
│   │   ├── storage/
│   │   ├── backups/
│   │   ├── admins/
│   │   ├── settings/
│   │   ├── auth/
│   │   ├── index.md
│   │   └── rules.md
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── storage-providers/
│   │   │   ├── r2/
│   │   │   ├── google-drive/
│   │   │   └── local-disk/
│   │   ├── cache/
│   │   ├── index.md
│   │   └── rules.md
│   │
│   ├── shared/
│   │   ├── dto/
│   │   ├── errors/
│   │   ├── utils/
│   │   ├── index.md
│   │   └── rules.md
│   │
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── index.md
└── rules.md
```

## 6. Core Domain Modules

### Media

Represents uploaded files.

Main concepts:

- MediaItem
- MediaFile
- MediaVariant
- MediaMetadata
- MediaStatus
- MediaType
- StorageLocation
- CacheStatus

Example statuses:

- Uploaded
- Cached
- BackedUp
- Failed
- Deleted

### Labels

Used to organize media.

Main concepts:

- Label
- MediaLabel
- LabelColor
- LabelGroup

Rules:

- A media item can have multiple labels.
- Labels should be reusable.
- Labels can be renamed without breaking media links.

### Storage

Represents runtime-configurable storage providers.

Main concepts:

- StorageProvider
- StorageProviderType
- StorageProviderSettings
- StorageObject
- StorageHealthStatus

Supported provider types:

- R2
- GoogleDrive
- LocalDisk

### Backups

Handles backup jobs and backup history.

Main concepts:

- BackupJob
- BackupRun
- BackupTarget
- BackupStatus
- BackupStrategy

Example strategies:

- Manual backup
- Scheduled backup
- Backup missing files only
- Backup all files

### Admins

Multi-admin access.

Main concepts:

- AdminAccount
- AdminSession
- AdminRole

Initial roles:

- Owner
- Admin

### Settings

Runtime configuration stored in database.

Main concepts:

- Local JSON app settings
- Storage settings
- Cache settings
- Backup settings

## 7. Prisma Model Draft

```prisma
model AdminAccount {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  displayName  String?
  role         String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MediaItem {
  id             String   @id @default(cuid())
  originalName   String
  mimeType       String
  mediaType      String
  sizeBytes      BigInt
  checksum       String?
  status         String
  activeProvider String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  files          MediaFile[]
  labels         MediaLabel[]
}

model MediaFile {
  id              String   @id @default(cuid())
  mediaItemId     String
  providerType    String
  providerKey     String
  storagePath     String
  publicUrl       String?
  isPrimary       Boolean  @default(false)
  isCached        Boolean  @default(false)
  localCachePath  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  mediaItem       MediaItem @relation(fields: [mediaItemId], references: [id])
}

model Label {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  media     MediaLabel[]
}

model MediaLabel {
  id          String @id @default(cuid())
  mediaItemId String
  labelId     String

  mediaItem   MediaItem @relation(fields: [mediaItemId], references: [id])
  label       Label     @relation(fields: [labelId], references: [id])

  @@unique([mediaItemId, labelId])
}

model StorageProviderSetting {
  id          String   @id @default(cuid())
  name        String
  type        String
  isActive    Boolean  @default(false)
  settingsJson Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BackupJob {
  id             String   @id @default(cuid())
  name           String
  sourceProvider String?
  targetProvider String
  strategy       String
  isEnabled      Boolean  @default(true)
  scheduleCron   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  runs           BackupRun[]
}

model BackupRun {
  id          String   @id @default(cuid())
  backupJobId String
  status      String
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
  message     String?

  backupJob   BackupJob @relation(fields: [backupJobId], references: [id])
}
```

## 8. Main Use Cases

### Media Use Cases

```text
modules/media/
├── upload-media.use-case.ts
├── list-media.use-case.ts
├── get-media-detail.use-case.ts
├── download-media.use-case.ts
├── delete-media.use-case.ts
├── cache-media-locally.use-case.ts
├── clear-media-cache.use-case.ts
├── update-media-metadata.use-case.ts
├── index.md
└── rules.md
```

### Label Use Cases

```text
modules/labels/
├── create-label.use-case.ts
├── update-label.use-case.ts
├── delete-label.use-case.ts
├── assign-label-to-media.use-case.ts
├── remove-label-from-media.use-case.ts
├── list-labels.use-case.ts
├── index.md
└── rules.md
```

### Storage Use Cases

```text
modules/storage/
├── create-storage-provider.use-case.ts
├── update-storage-provider.use-case.ts
├── set-active-storage-provider.use-case.ts
├── test-storage-provider.use-case.ts
├── list-storage-providers.use-case.ts
├── index.md
└── rules.md
```

### Backup Use Cases

```text
modules/backups/
├── create-backup-job.use-case.ts
├── update-backup-job.use-case.ts
├── run-backup-now.use-case.ts
├── list-backup-jobs.use-case.ts
├── list-backup-runs.use-case.ts
├── restore-media-from-backup.use-case.ts
├── index.md
└── rules.md
```

### Admin/Auth Use Cases

```text
modules/admins/
├── create-admin.use-case.ts
├── update-admin.use-case.ts
├── disable-admin.use-case.ts
├── list-admins.use-case.ts
├── login-admin.use-case.ts
├── logout-admin.use-case.ts
├── get-current-admin.use-case.ts
├── index.md
└── rules.md
```

### Settings Use Cases

```text
modules/settings/
├── get-settings.use-case.ts
├── update-settings.use-case.ts
├── reload-settings.use-case.ts
├── index.md
└── rules.md
```

## 9. API Endpoints Draft

### Auth

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Admins

```text
GET    /admins
POST   /admins
PATCH  /admins/:id
DELETE /admins/:id
```

### Media

```text
GET    /media
POST   /media/upload
GET    /media/:id
GET    /media/:id/download
PATCH  /media/:id
DELETE /media/:id
POST   /media/:id/cache
DELETE /media/:id/cache
```

### Labels

```text
GET    /labels
POST   /labels
PATCH  /labels/:id
DELETE /labels/:id
POST   /media/:id/labels/:labelId
DELETE /media/:id/labels/:labelId
```

### Storage Providers

```text
GET    /storage-providers
POST   /storage-providers
PATCH  /storage-providers/:id
POST   /storage-providers/:id/activate
POST   /storage-providers/:id/test
DELETE /storage-providers/:id
```

### Backups

```text
GET    /backup-jobs
POST   /backup-jobs
PATCH  /backup-jobs/:id
DELETE /backup-jobs/:id
POST   /backup-jobs/:id/run
GET    /backup-runs
GET    /backup-runs/:id
```

### Settings

```text
GET    /settings
PATCH  /settings
POST   /settings/reload
```

## 10. API DTO Directory Pattern

All API DTOs should follow the same searchable pattern:

```text
modules/<module>/dtos/
├── requests/
├── responses/
└── index.ts
```

Example:

```text
api/media/dto/
├── requests/
│   ├── upload-media.request.dto.ts
│   ├── list-media.request.dto.ts
│   └── update-media.request.dto.ts
├── responses/
│   ├── media-item.response.dto.ts
│   └── media-detail.response.dto.ts
└── index.ts
```

DTO rules:

- Single DTO definition.
- No duplicate DTOs.
- Shared between API and Use Cases when needed.
- api-clients must reuse the same contract shape.

## 11. Storage Provider Design

Use a shared storage contract only because R2, Google Drive, and local disk are replaceable infrastructure.

```ts
export interface MediaStorageProvider {
  upload(input: UploadMediaObjectInput): Promise<UploadedMediaObject>;
  download(input: DownloadMediaObjectInput): Promise<NodeJS.ReadableStream>;
  delete(input: DeleteMediaObjectInput): Promise<void>;
  exists(input: CheckMediaObjectInput): Promise<boolean>;
  getSignedDownloadUrl?(input: GetSignedDownloadUrlInput): Promise<string>;
}
```

Implementations:

```text
infrastructure/storage-providers/
├── r2/
│   ├── r2-media-storage.provider.ts
│   └── r2-settings.schema.ts
├── google-drive/
│   ├── google-drive-media-storage.provider.ts
│   └── google-drive-settings.schema.ts
└── local-disk/
    ├── local-disk-media-storage.provider.ts
    └── local-disk-settings.schema.ts
```

Provider selection must happen inside Use Cases or an application service, not inside API controllers.

## 12. Local Cache Design

Local cache is not the source of truth.

Rules:

- Cache files on local disk for faster downloads/previews.
- Cache can be cleared anytime.
- Media source remains the active storage provider or backup provider.
- Cache path must be stored in DB only as operational metadata.

Suggested path pattern:

```text
.local-cache/media/<mediaItemId>/<fileId>/<originalName>
```

## 13. Backup Design

Backup jobs copy media objects from one provider to another.

Examples:

- R2 to Google Drive
- Google Drive to R2
- Local disk to R2
- Active provider to backup provider

Backup run should record:

- Start time
- Finish time
- Status
- Number of files processed
- Number of files failed
- Error message if failed

## 14. UI Structure

```text
ui/
├── app/
│   ├── login/
│   ├── media/
│   ├── labels/
│   ├── storage-providers/
│   ├── backups/
│   ├── admins/
│   └── settings/
├── components/
│   ├── media/
│   ├── labels/
│   ├── storage/
│   ├── backups/
│   └── shared/
├── lib/
│   ├── api-client/
│   ├── auth/
│   └── utils/
├── index.md
└── rules.md
```

Main pages:

- Login
- Media library
- Media detail
- Upload media
- Labels
- Storage providers
- Backup jobs
- Backup runs
- Admin management
- Settings

## 15. API Client Package

```text
api-clients/
├── src/
│   ├── media/
│   ├── labels/
│   ├── storage-providers/
│   ├── backups/
│   ├── admins/
│   ├── auth/
│   ├── settings/
│   └── index.ts
├── index.md
└── rules.md
```

Rules:

- TypeScript only.
- Contains interfaces, DTOs, and implementations.
- Can be copied into other apps.
- Can be published to npm later.
- UI should consume this package instead of manually calling fetch everywhere.

## 16. API MCP Server

Use for internal operations:

```text
api-mcp-server/
├── src/
│   ├── mock-data/
│   ├── smoke-tests/
│   ├── migrations/
│   ├── dirty-data-fixes/
│   └── maintenance/
├── index.md
└── rules.md
```

Use cases:

- Generate mock media data
- Smoke test upload/download/cache/backup
- Fix dirty storage records
- Verify missing files
- Verify backup consistency
- Run maintenance scripts

## 17. Handoff Documents

```text
handoffs/
├── backend-to-ui/
├── ui-to-backend/
└── archive/
```

Backend to UI handoff required for:

- API contract changes
- DTO changes
- Endpoint changes
- Authentication changes

UI to Backend handoff required for:

- Missing APIs
- New backend requirements
- New backend capabilities

Completed handoffs must be moved to:

```text
handoffs/archive/
```

## 18. Suggested Implementation Phases

### Phase 1: Project Bootstrap

- Create root structure.
- Create NestJS app.
- Create Next.js UI.
- Create api-clients package.
- Create api-mcp-server package.
- Add index.md and rules.md to every major layer.

### Phase 2: Database and Prisma

- Configure Prisma.
- Support SQLite for development.
- Support PostgreSQL for production.
- Create initial schema.
- Add seed script for first admin account.

### Phase 3: Auth and Admins

- Implement admin login.
- Implement session/JWT auth.
- Implement multi-admin management.
- Protect all media/admin/settings APIs.

### Phase 4: Runtime Settings

- Store settings in database.
- Build settings loader.
- Reload settings after changes.
- Add UI for settings.

### Phase 5: Storage Providers

- Implement local disk provider first.
- Implement R2 provider.
- Implement Google Drive provider.
- Add storage provider test endpoint.
- Add active provider switching.

### Phase 6: Media Upload and Download

- Upload media through active provider.
- Store metadata in DB.
- Download media.
- List media.
- View media details.

### Phase 7: Local Cache

- Cache files locally.
- Download from cache when available.
- Clear cache per media item.
- Add cache status to UI.

### Phase 8: Labels

- Create/update/delete labels.
- Assign/remove labels from media.
- Filter media by labels.

### Phase 9: Backups

- Create backup jobs.
- Run backup manually.
- Store backup run history.
- Add provider-to-provider backup.

### Phase 10: API Clients and Smoke Tests

- Generate/update api-clients.
- Add smoke tests in api-mcp-server.
- Test auth, upload, download, cache, labels, backup.
- Update handoffs, index.md, and rules.md.

## 19. First Codex Task Prompt

```text
Set up the project structure for a media management app using the provided rules.

Stack:
- Backend: NestJS
- Frontend: Next.js
- ORM: Prisma
- Dev DB: SQLite
- Production DB: PostgreSQL
- Auth: multi-admin only
- Storage providers: Cloudflare R2, Google Drive, local disk
- Media types: all file types

Requirements:
- Create root folders: app, ui, api-clients, api-mcp-server, handoffs, agents.
- Add index.md and rules.md to root and every major layer.
- In app, create folders for core, modules, infrastructure, shared.
- Follow DDD boundaries.
- No repository layer.
- API must call Use Cases only.
- Use Cases may access Prisma directly.
- Infrastructure must not contain business logic.
- Settings must be stored in database, not .env.
- Code must be split into small, searchable files.
- DTOs must follow a consistent directory pattern.

Do not implement full business logic yet. Only create the structure, documentation files, initial package setup, and placeholder modules.
```

