# DG Technologies Landing Page

Single-page premium dark marketing site for DG Technologies, a firm that builds affordable websites for small businesses entirely over the phone.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Landing page app: `artifacts/dg-technologies` (frontend-only, no backend)
- Sections: `artifacts/dg-technologies/src/components/sections/`
- Booking link (all CTAs): `artifacts/dg-technologies/src/lib/booking.ts` — swap `BOOKING_URL` here to point CTAs at Calendly/phone
- Theme: `artifacts/dg-technologies/src/index.css`
- Original copy/design brief: `attached_assets/Pasted--Replit-Agent-Prompt-DG-Technologies-Landing-Page-Copy-_1784651014656.txt`

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
