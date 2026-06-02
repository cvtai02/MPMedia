# api-mcp-server Rules

- Scripts run against a live app instance via HTTP.
- Never import Prisma directly — use the HTTP API.
- Destructive scripts must prompt for confirmation.
- Log all actions to stdout.
