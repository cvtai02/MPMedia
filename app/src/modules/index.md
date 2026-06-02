# modules/

Feature modules contain backend application behavior. Each module owns its HTTP boundary, use cases, and shared DTOs.

## Modules

| Module | Purpose |
|--------|---------|
| admins | Admin account management |
| auth | Login, logout, and current admin identity |
| backups | Backup jobs and backup runs |
| collections | Collection groups and collection labels |
| file-types | File type definitions and open strategies |
| labels | Global media labels |
| media | Upload, list, download, cache, and metadata operations |
| settings | Runtime settings API backed by local JSON configuration |
| storage | Storage provider settings and health checks |
