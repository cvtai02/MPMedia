# Agent Instructions

AI agents working in this project must follow `rules.md` and the layer-specific `rules.md` files before changing code.

## Required Workflow

- Read `index.md` at the project root and in the layer or module being changed.
- Keep backend code in `app/src/modules/<module>/api`, `app/src/modules/<module>/usecases`, and `app/src/modules/<module>/dtos`.
- Keep one controller, use case, and DTO per file unless the DTO is a small nested response shape used only by its parent DTO.
- Update relevant `index.md` and `rules.md` files whenever folder structure, APIs, DTOs, use cases, infrastructure adapters, or module boundaries change.
- Create a handoff document for backend/UI contract changes.
- Run the smallest useful verification command before finishing.
