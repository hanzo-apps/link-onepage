import type { BaseRecord } from '@hanzo/base/react'

/**
 * The data contract for Link Onepage, in ONE place — the two collections
 * schema.sql provisions, mirrored as types, plus the demo content the
 * signed-out preview renders and two tiny pure helpers the views share.
 */

/** The page header. One row per org (the app reads the first). */
export interface Profile extends BaseRecord {
  name: string
  bio: string
  avatar: string
}

/** One tappable link button, drawn in ascending `sort`. */
export interface Link extends BaseRecord {
  label: string
  url: string
  sort: number
  clicks: number
}

/** Collection names — the single source shared by every useQuery/useMutation. */
export const PROFILE = 'profile'
export const LINKS = 'links'

/** Links in display order — ascending `sort`, `created` as the stable tie-break. */
export function ordered(links: Link[]): Link[] {
  return [...links].sort(
    (a, b) => a.sort - b.sort || (a.created ?? '').localeCompare(b.created ?? ''),
  )
}

/**
 * Sample content for the signed-out preview — a self-contained demo of the
 * page (no network, no fabricated analytics), so the hero renders live before
 * you sign in. Your real page replaces it the moment you do.
 */
export const DEMO_PROFILE = {
  name: 'Ada Nakamoto',
  bio: 'Designer & builder. Making small, sharp things for the open web.',
  avatar: '',
} as const

export const DEMO_LINKS: readonly { label: string; url: string }[] = [
  { label: 'Portfolio', url: 'https://example.com' },
  { label: 'Read the journal', url: 'https://example.com/journal' },
  { label: 'Latest project — Prism', url: 'https://example.com/prism' },
  { label: 'Say hello', url: 'mailto:hi@example.com' },
]

/** Initials for the avatar fallback — up to two letters, always uppercase. */
export function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * A tappable href from raw user input: keep explicit schemes (http, mailto,
 * tel, …) as typed; otherwise assume the web and prefix `https://`.
 */
export function href(url: string): string {
  const u = url.trim()
  return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`
}

/** The bare host of a URL, for the small caption under each link label. */
export function host(url: string): string {
  try {
    return new URL(href(url)).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
