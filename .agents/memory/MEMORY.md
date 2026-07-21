# Memory Index

- [Orval + zod codegen pitfalls](orval-zod-codegen.md) — never use `format: email` in the OpenAPI spec; orval emits zod-v4 calls that break against installed zod v3. Use regex `pattern` instead.
- [Deployment build ≠ local root build](deployment-build-vs-local.md) — publish builds inject artifact.toml env (PORT etc.); root `pnpm run build` doesn't. Always read real build logs before blaming code.
