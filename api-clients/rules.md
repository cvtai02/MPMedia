# api-clients Rules

- TypeScript only. No runtime dependencies except what fetch provides.
- All clients extend BaseApiClient.
- Types mirror the backend DTOs exactly.
- Do not add business logic here — only HTTP transport.
- Can be published to npm independently.
