# Link Onepage

A link-in-bio page you **own** — one page of your links, profile, and highlights
that you edit yourself. Fork it on [hanzo.app](https://hanzo.app) and deploy live
on Hanzo Cloud.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) primitives
  only (the Hanzo design system) under Vite + React 19. Centered, mobile-first,
  monochrome — big tappable link buttons, no gradients.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Your profile and links are real Base rows.

Three views, one page:

| View | What it is |
| --- | --- |
| **Page** | The public link page — avatar, name, bio, and your links as big buttons. Signed out, it previews live with demo content; signed in, it's your own rows. Tapping a link opens it and counts the tap. |
| **Editor** | Edit your profile (name · bio · avatar) and manage links — add, rename, reorder, remove. |
| **Analytics** | Analytics-lite — your links ranked by real taps, with totals and the top link. |

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the preview and the sign-in flow. Copy `.env.example` to
`.env` to point at a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base.

The one deploy requirement: the IAM client (`VITE_HANZO_CLIENT_ID`) must list
this origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every
forked app works, or register a dedicated `hanzo-link-onepage` client.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org
(`@request.auth.org_id = org`). Two collections:

- **`profile`** — `name`, `bio`, `avatar` (one row: your page header).
- **`links`** — `label`, `url`, `sort` (display order), `clicks` (real tap
  counter the Analytics view reads).

At runtime the views read/write those collections through `@hanzo/base/react`
(`useQuery`/`useMutation`) carrying the IAM token. Keep `schema.sql` in lockstep
with `src/lib/page.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx            entry
  providers.tsx       GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx             route (/auth/callback) + auth gate
  gui.config.ts       createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts       IAM PKCE config
  env.ts              the VITE_ env contract, one place
  lib/
    base.ts           BaseClient carrying the IAM bearer token
    page.ts           types (Profile · Link), demo content, small helpers
  auth/callback.tsx   PKCE return leg
  components/
    page-view.tsx     the public link page (shared: preview + Page tab)
  views/
    signed-out.tsx    landing — live preview + sign-in
    shell.tsx         signed-in shell (Page · Editor · Analytics tabs)
    page.tsx          your link page from Base
    editor.tsx        profile form + link CRUD/reorder
    analytics.tsx     analytics-lite (taps per link)
schema.sql            databaseSchema -> Base collections on publish
hanzo.yml             Hanzo Cloud build/deploy manifest
```
