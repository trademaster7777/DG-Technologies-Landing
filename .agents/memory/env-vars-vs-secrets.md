---
name: Env vars vs secrets
description: setEnvVars writes values into the committed .replit file — never use it for tokens or credentials
---

Rule: any credential-like value (admin tokens, API keys) must go through `requestSecrets`, never `setEnvVars`, even if agent-generated.

**Why:** `setEnvVars` persists values into `.replit` under `userenv.*`, which is version-controlled. A completion code review rejected a task because a generated ADMIN_TOKEN landed in the committed `.replit`.

**How to apply:** When an endpoint needs a shared-secret guard, design it to fail gracefully (e.g. 503) when the secret is unset, use `requestSecrets` to have the user supply it, and rotate anything that ever touched `.replit`.
