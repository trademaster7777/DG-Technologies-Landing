---
name: Orval + zod v3 codegen pitfalls
description: OpenAPI spec constructs that break this monorepo's orval codegen against zod v3
---

**Rule:** In `lib/api-spec/openapi.yaml`, do not use `format: email` (and be wary of other string formats) on schema properties. Orval emits zod-v4 style validators (e.g. `zod.email()`) that don't exist in the zod v3 installed in this workspace, breaking the generated `@workspace/api-zod` build.

**Why:** Hit this while adding a lead-capture endpoint (July 2026): codegen succeeded but typecheck failed on `zod.email is not a function`.

**How to apply:** Use a regex `pattern` constraint instead (e.g. a simple email regex) when a string field needs format validation. After editing the spec, always run codegen and typecheck the generated packages before wiring routes/UI.
