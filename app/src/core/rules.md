# Core Rules

- No framework imports (no NestJS, no Prisma) in domain types.
- Domain types are plain TypeScript interfaces and enums.
- Storage contracts (interfaces) live here only when implemented by Infrastructure.
