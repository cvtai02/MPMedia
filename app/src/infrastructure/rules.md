# Infrastructure Rules

- Do not put business logic in infrastructure.
- Infrastructure may depend on core/shared contracts and provider SDKs.
- Provider-specific details must not leak into controllers or use cases.
- Storage providers must implement the media storage provider contract.
- Runtime settings are stored in `config/app-settings.local.json` through `settings/`.
- Keep local runtime data and generated provider configuration out of git.
