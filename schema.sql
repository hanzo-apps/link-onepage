-- Hanzo Base schema for Link Onepage — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/page.ts + src/views/page.tsx · editor.tsx · analytics.tsx).

-- Your profile — the header of the page. One row per org (the app reads the
-- first): your name, a short bio, and an avatar image URL.
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name   TEXT NOT NULL DEFAULT '',
  bio    TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT ''    -- image URL (empty → monogram fallback)
);

-- Your links — the big tappable buttons, drawn in ascending `sort`. `clicks`
-- is a real counter each button bumps on tap; analytics-lite reads it.
-- (`sort` not `order`: `order` is a reserved SQL word.)
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label  TEXT NOT NULL,
  url    TEXT NOT NULL,
  sort   INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0
);
