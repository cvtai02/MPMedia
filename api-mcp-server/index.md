# MPMedia API MCP Server

Internal tooling server for the MPMedia NestJS backend. Exposes maintenance and testing operations as MCP tools callable from Claude.

## Tools

| Tool | Description |
|------|-------------|
| `smoke_test` | Full upload/cache/label/cleanup smoke test |
| `generate_mock_data` | Upload N mock text/JSON files |
| `list_media` | Paginated media list with filters |
| `list_labels` | All labels |
| `list_storage_providers` | Providers + active status |
| `test_storage_provider` | Health-check a specific provider |
| `get_settings` | Current app settings |
| `verify_storage` | Check cached files exist on disk, optionally re-cache |
| `verify_backup` | Backup job status |
| `clear_orphan_caches` | Fix stuck Cached-status items |

## Configuration (env vars)

| Var | Default |
|-----|---------|
| `API_BASE_URL` | `http://localhost:3000` |
| `API_ADMIN_EMAIL` | `admin@mpmedia.local` |
| `API_ADMIN_PASSWORD` | `admin123` |

## Add to Claude Code

```json
{
  "mcpServers": {
    "mpmedia": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/api-mcp-server",
      "env": {
        "API_BASE_URL": "http://localhost:3000",
        "API_ADMIN_EMAIL": "admin@mpmedia.local",
        "API_ADMIN_PASSWORD": "admin123"
      }
    }
  }
}
```
