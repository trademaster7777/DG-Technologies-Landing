---
name: Stale project-reference declarations
description: Type errors about fields "missing" that exist in source usually mean stale built .d.ts in lib/* project references.
---

Rule: if `tsc` reports a property missing from a `@workspace/db` or `@workspace/api-zod` type even though the source clearly has it, rebuild the referenced packages first: `npx tsc -b lib/db lib/api-zod`.

**Why:** api-server uses TypeScript project references; the lib packages export `src/*.ts` at runtime but tsc consumes their built `dist/*.d.ts`, which goes stale after schema/codegen changes merged by other tasks.

**How to apply:** After any upstream schema or zod-codegen change (or a task merge touching lib/db / lib/api-zod), run `tsc -b` on those libs before trusting typecheck results in artifacts/api-server.
