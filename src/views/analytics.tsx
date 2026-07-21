import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, Paragraph, Spinner, Button } from '@hanzo/gui'
import { LINKS, host, type Link } from '../lib/page'

/** One summary number in a bordered tile. */
function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <YStack
      flex={1}
      minWidth={140}
      gap="$1"
      padding="$4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$6"
    >
      <Text fontSize="$9" fontWeight="800" color="$color">{value}</Text>
      <Text fontSize="$2" opacity={0.55} color="$color">{label}</Text>
    </YStack>
  )
}

/**
 * Analytics-lite — the third tab. Reads the same `links` rows and ranks them by
 * the real `clicks` counter the Page tab bumps on every tap. No estimates, no
 * fabricated numbers: an empty page shows zeros until a link is actually tapped.
 */
export function Analytics({ onEdit }: { onEdit: () => void }) {
  const linksQ = useQuery<Link>(LINKS, { realtime: false })

  if (linksQ.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    )
  }
  if (linksQ.error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
        <Paragraph color="$red10" textAlign="center" maxWidth={420}>
          Couldn’t reach Base ({linksQ.error.message}).
        </Paragraph>
      </YStack>
    )
  }

  const links = linksQ.data
  if (links.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6" backgroundColor="$background">
        <H2 textAlign="center" color="$color">Nothing to measure yet</H2>
        <Paragraph textAlign="center" opacity={0.6} maxWidth={360} color="$color">
          Add links in the Editor, then taps land here — ranked by how often each one is opened.
        </Paragraph>
        <Button size="$4" theme="active" onPress={onEdit}>Add links</Button>
      </YStack>
    )
  }

  const ranked = [...links].sort((a, b) => b.clicks - a.clicks || a.sort - b.sort)
  const total = links.reduce((sum, l) => sum + l.clicks, 0)
  const max = ranked[0].clicks
  const top = total > 0 ? ranked[0] : null

  return (
    <YStack width="100%" maxWidth={560} alignSelf="center" padding="$4" gap="$6">
      <H2 fontSize="$7" color="$color">Analytics</H2>

      <XStack gap="$3" flexWrap="wrap">
        <Stat value={total} label="Total taps" />
        <Stat value={links.length} label="Links" />
        <Stat value={top ? top.label : '—'} label="Top link" />
      </XStack>

      <YStack gap="$3">
        {ranked.map((link) => (
          <YStack key={link.id} gap="$2">
            <XStack alignItems="center" justifyContent="space-between" gap="$3">
              <YStack flex={1} gap="$1">
                <Text fontSize="$4" fontWeight="600" color="$color">{link.label}</Text>
                <Text fontSize="$1" opacity={0.5} color="$color">{host(link.url) || link.url}</Text>
              </YStack>
              <Text fontSize="$5" fontWeight="700" color="$color">{link.clicks}</Text>
            </XStack>
            <XStack width="100%" height={8} backgroundColor="$color2" borderRadius="$10" overflow="hidden">
              <YStack backgroundColor="$color11" flexGrow={link.clicks} flexBasis={0} />
              <YStack flexGrow={Math.max(0, max - link.clicks)} flexBasis={0} />
            </XStack>
          </YStack>
        ))}
      </YStack>

      {total === 0 ? (
        <Paragraph fontSize="$2" opacity={0.5} textAlign="center" color="$color">
          No taps yet — open a link from the Page tab and its count lands here.
        </Paragraph>
      ) : null}
    </YStack>
  )
}
