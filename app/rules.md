# Backend Rules

- Controllers call use cases only. They must not contain business logic.
- Use cases own business logic and may access Prisma directly.
- Infrastructure implements contracts from `core/` or `shared/` when a contract is needed.
- Feature code lives in `src/modules/<module>/`.
- Each module must contain `api/`, `usecases/`, and `dtos/`.
- DTOs live in `src/modules/<module>/dtos/requests/` and `src/modules/<module>/dtos/responses/`.
- API/controllers and use cases must use the same DTO definitions from the module `dtos/` folder.
- No duplicate DTOs. Share DTO shapes via `api-clients/` when possible.
- Runtime settings are loaded from `config/app-settings.local.json`, not `.env` or the database.
- All modules must have their own `index.md` and `rules.md`.
- Entity and aggregate classes must protect their invariants with public/private members so invalid state cannot be created or persisted accidentally.
