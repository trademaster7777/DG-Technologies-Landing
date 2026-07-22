# Memory Index

- [Orval + zod codegen pitfalls](orval-zod-codegen.md) — never use `format: email` in the OpenAPI spec; orval emits zod-v4 calls that break against installed zod v3. Use regex `pattern` instead.
- [Deployment build ≠ local root build](deployment-build-vs-local.md) — publish builds inject artifact.toml env (PORT etc.); root `pnpm run build` doesn't. Always read real build logs before blaming code.
- [Task merges can drop uncommitted files](task-merge-clobber.md) — concurrent merges may silently remove new files/scripts; re-verify working tree before re-review.
- [Env vars vs secrets](env-vars-vs-secrets.md) — setEnvVars writes into the committed .replit; credentials must go through requestSecrets, even agent-generated tokens.
- [Stale project-reference declarations](stale-project-reference-types.md) — "missing property" type errors for fields that exist in source mean stale lib/* .d.ts; run `npx tsc -b lib/db lib/api-zod`.
