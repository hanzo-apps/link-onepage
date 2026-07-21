import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, H2, Paragraph, Spinner, Button } from '@hanzo/gui'
import { PROFILE, LINKS, ordered, type Profile, type Link } from '../lib/page'
import { PageView } from '../components/page-view'

const BLANK = { name: '', bio: '', avatar: '' }

/**
 * The Page tab — the public link page rendered from YOUR Base rows (profile +
 * links), the same presentational surface the signed-out landing previews.
 * Tapping a link opens it and bumps its `clicks` counter (read by Analytics).
 */
export function Page({ onEdit }: { onEdit: () => void }) {
  const profileQ = useQuery<Profile>(PROFILE, { realtime: false })
  const linksQ = useQuery<Link>(LINKS, { realtime: false })
  const bump = useMutation(LINKS, 'update')

  if (profileQ.isLoading || linksQ.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    )
  }

  const error = profileQ.error || linksQ.error
  if (error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
        <Paragraph color="$red10" textAlign="center" maxWidth={420}>
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re
          signed in.
        </Paragraph>
      </YStack>
    )
  }

  const profile = profileQ.data[0]
  const links = ordered(linksQ.data)

  if (!profile && links.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6" backgroundColor="$background">
        <H2 textAlign="center" color="$color">Your page is empty</H2>
        <Paragraph textAlign="center" opacity={0.6} maxWidth={360} color="$color">
          Add your name, bio, and first links in the Editor — they show up here the moment you
          save.
        </Paragraph>
        <Button size="$4" theme="active" onPress={onEdit}>Set up your page</Button>
      </YStack>
    )
  }

  return (
    <PageView
      profile={profile ?? BLANK}
      links={links}
      onTap={(l) => {
        const row = links.find((r) => r.id === l.id)
        if (row) void bump.mutate({ id: row.id, clicks: row.clicks + 1 })
      }}
    />
  )
}
