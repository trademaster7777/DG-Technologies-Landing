# D2G Technology Landing Page

Single-page premium dark marketing site for D2G Technology (brand name per the uploaded logo), a firm that builds affordable websites for small businesses entirely over the phone.

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

- Landing page app: `artifacts/dg-technologies`
- Lead capture: booking form in `src/components/sections/FinalCTA.tsx` (section `#book`) → `POST /api/leads` (`artifacts/api-server/src/routes/leads.ts`) → `leads` table (`lib/db/src/schema/leads.ts`). Protected by per-IP rate limit (5/10min) + honeypot field.
- Sections: `artifacts/dg-technologies/src/components/sections/`
- Booking link (all CTAs): `artifacts/dg-technologies/src/lib/booking.ts` — swap `BOOKING_URL` here to point CTAs at Calendly/phone
- Theme: `artifacts/dg-technologies/src/index.css` (`:root` = light palette, `.dark` = dark palette). Toggle: `src/components/ThemeProvider.tsx` + `src/components/ui/ThemeToggle.tsx` — `dark` class on `<html>`, persisted in localStorage `d2g-theme`, dark is the default, `?theme=light|dark` URL override (handy for screenshots)
- Original copy/design brief: `attached_assets/Pasted--Replit-Agent-Prompt-DG-Technologies-Landing-Page-Copy-_1784651014656.txt`

## Architecture decisions

- Theming rule: components use `foreground`/`background` token utilities (e.g. `text-foreground/70`, `bg-foreground/5`) so both themes work. `text-white` is ONLY kept on colored gradient surfaces (primary CTA buttons, badges, success checkmark) — follow this rule when adding components. FOUC is prevented by an inline pre-paint script in `index.html` that must stay in sync with `ThemeProvider` defaults.

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
