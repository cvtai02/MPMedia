# Global Project Rules

- Follow the required root structure: `app/`, `ui/`, `handoffs/`, `handoffs/archive/`, `api-clients/`, `api-mcp-server/`, `index.md`, `rules.md`, and `agents-instructions.md`.
- Use modular Domain-Driven Design.
- No repository layer. Prisma is the persistence core.
- Use cases may access Prisma directly.
- API controllers must call use cases only.
- API controllers must not access infrastructure directly.
- Infrastructure must not contain business logic.
- Infrastructure implements core or shared contracts when real separation is needed.
- Runtime settings must be stored in a local JSON configuration file and ignored by git.
- No `.env` file should be required in production.
- Settings must be editable from the UI.
- Settings must be loaded on startup and after changes.
- Generated code must be split into small, searchable files.
- Avoid large monolithic files.
- If code is duplicated twice, modularize it.
