# api-clients/ — TypeScript API SDK

Shared TypeScript API client for the MPMedia backend.

## Modules

| Module | Purpose |
|--------|---------|
| auth/ | Login, logout, get current admin |
| media/ | Upload, list, download, cache, delete media |
| labels/ | CRUD labels, assign/remove from media |
| storage-providers/ | Manage and switch storage providers |
| backups/ | Manage backup jobs and runs |
| admins/ | Manage admin accounts |
| settings/ | Read and update app settings |

## Usage

```ts
import { MpMediaApiClient } from '@mpmedia/api-clients';

const client = new MpMediaApiClient('http://localhost:3000', () => getToken());
const media = await client.media.list();
```
