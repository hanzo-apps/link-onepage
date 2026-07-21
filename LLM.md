# link-onepage — agent notes

A link-in-bio page you own, built on the canonical Hanzo app stack: Vite +
React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data). Forked
from `hanzo-apps/hanzo-starter` — provider stack, `vite.config.ts`, auth, and the
deploy contract are IDENTICAL to the starter; only the app on top differs. Keep
it REAL — every surface builds and runs, no fabricated UI, no fabricated metrics.

## The app

- **One page, three views** (`src/views/`):
  - `page.tsx` — the public link page from your Base rows (profile + links as big
    buttons). Tapping a link opens it and bumps `links.clicks`.
  - `editor.tsx` — profile form (name · bio · avatar) + link CRUD and reorder.
  - `analytics.tsx` — analytics-lite: links ranked by the real `clicks` counter.
- **`signed-out.tsx`** is the landing: it renders the same `components/page-view.tsx`
  with demo content (`DEMO_PROFILE`/`DEMO_LINKS` in `src/lib/page.ts`) so the
  hero is a live preview, plus the PKCE sign-in button.
- **`shell.tsx`** is the signed-in shell: brand bar + a three-tab switch (no
  router — tab state in memory, same "one static SPA" stance as the auth gate).
- **`components/page-view.tsx`** is the ONE presentational surface shared by the
  signed-out preview and the signed-in Page tab. DRY: the page is defined once.

## Data contract

- **`schema.sql`** provisions two org-scoped Base collections; `src/lib/page.ts`
  mirrors them as `Profile` (name · bio · avatar) and `Link` (label · url · sort ·
  clicks) and is the single source for collection names, demo content, and the
  `ordered`/`host`/`monogram`/`href` helpers. Keep them in lockstep.
- `sort` (not `order`) is the display-order column — `order` is a reserved SQL
  word. Links are ordered client-side by `ordered()` for a deterministic result.
- `clicks` is a real per-link counter the Page tab increments on tap; Analytics
  reads it. No estimates — a page with no taps shows zeros.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (unchanged
  from the starter): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No `@hanzogui/vite-plugin`.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `borderRadius`/`textAlign`/`alignSelf` — NOT the `items`/`justify`/`bg`/`p`/
  `rounded`/`text`/`self` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Button`/pressables use `onPress`; `Input`/`TextArea` use `value`/`onChangeText`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **Auth reads `import.meta.env.VITE_HANZO_CLIENT_ID`** (fallback `hanzo-app`) in
  `src/env.ts` — the one place env is read.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  must allow this origin's `/auth/callback` (a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client, or a per-app `hanzo-link-onepage` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · CI (`.github/workflows/ci.yml`)
runs `npm ci && npm run typecheck && npm run build` — build-verification only,
NEVER a container image (Hanzo Cloud owns deploys; do not build images locally).
