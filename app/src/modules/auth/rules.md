# auth Module Rules

- Keep controllers in `api/` and use cases in `usecases/`.
- Controllers must call use cases and use DTOs from `dtos/`.
- Use cases may access Prisma directly and may use infrastructure through dependency injection.
- Keep one business action per use case file.
- Keep request DTOs in `dtos/requests/` and response DTOs in `dtos/responses/`.
- Update this module's `index.md` when API routes, DTOs, use cases, or module boundaries change.
