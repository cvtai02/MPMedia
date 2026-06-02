# app/ NestJS Backend

Entry point: `src/main.ts`

## Layer Overview

| Layer | Path | Purpose |
|-------|------|---------|
| modules/ | src/modules/ | Feature modules with API, use cases, and DTOs |
| core/ | src/core/ | Domain entities, value objects, and contracts |
| infrastructure/ | src/infrastructure/ | Prisma, settings JSON service, storage providers, and cache |
| shared/ | src/shared/ | Shared errors, utilities, and cross-module helpers |

## Module Layout

Each feature module follows:

```text
src/modules/<module>/
├── api/
├── usecases/
├── dtos/
├── index.md
└── rules.md
```

Current modules: `admins`, `auth`, `backups`, `collections`, `file-types`, `labels`, `media`, `settings`, and `storage`.
