---
name: Deployment build ≠ local root build
description: Why root `pnpm run build` can fail locally while the real publish build succeeds, and how to debug publish failures correctly.
---

# Deployment build vs local root build

Rule: never diagnose a publish failure from a local `pnpm run build` repro alone — always pull the real build log first (`listDeploymentBuilds` → `getDeploymentBuild` from the deployment skill).

**Why:** The publish pipeline builds each artifact with its `artifact.toml` `[services.env]` applied (e.g. PORT, BASE_PATH), but the root `pnpm run build` script does not inject those. Artifacts whose `vite.config.ts` hard-requires PORT/BASE_PATH (video/mockup scaffolds do) therefore fail the local root build while building perfectly fine during publish. A local repro once pointed at the wrong culprit; the actual failure was a transient Replit registry blob-push error after all builds succeeded (fix = just retry publishing).

**How to apply:** On "publish failed" reports: fetch real build logs first, classify the phase (build → promote → serve, or infra push errors like `could not push blob mount`), and only then decide between code fix, config fix, or plain retry. Infra-side errors (registry/deployer) → user retries or contacts support; no code changes.
