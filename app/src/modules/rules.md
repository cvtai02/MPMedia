# modules/ Rules

- Keep feature code under `src/modules/<module>/`.
- Each module must contain `api/`, `usecases/`, and `dtos/`.
- Controllers belong in `api/` and must call use cases.
- Use cases belong in `usecases/` and should be one business action per file.
- DTOs belong in `dtos/requests/` or `dtos/responses/` and are shared by controllers and use cases.
- Prefer module-local DTOs. Cross-module DTO imports are allowed only when returning another module's established API shape.
- Update the module `index.md` when routes, DTOs, use cases, or module boundaries change.
- Update the module `rules.md` when implementation constraints change.
