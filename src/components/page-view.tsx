import type { ReactNode } from 'react'
import { YStack, Avatar, H1, Paragraph, Text, Button } from '@hanzo/gui'
import { href, host, monogram } from '../lib/page'

/** The minimum a link needs to be drawn + opened. */
export interface DisplayLink {
  id?: string
  label: string
  url: string
}

interface PageViewProps {
  profile: { name: string; bio: string; avatar: string }
  links: readonly DisplayLink[]
  /** Side effect on tap (e.g. count the click); the link always opens after. */
  onTap?: (link: DisplayLink) => void
  /** Slot below the links (a sign-in CTA on the preview, empty otherwise). */
  footer?: ReactNode
}

function open(url: string) {
  if (typeof window !== 'undefined') {
    window.open(href(url), '_blank', 'noopener,noreferrer')
  }
}

/**
 * The public link page — the one presentational surface shared by the
 * signed-out preview (demo content) and the signed-in Page tab (your Base
 * rows). Centered, mobile-first, monochrome: a monogram/photo, your name and
 * bio, then big tappable link buttons. No color accents, no gradients — the
 * contrast IS the design.
 */
export function PageView({ profile, links, onTap, footer }: PageViewProps) {
  const name = profile.name.trim() || 'Your name'
  const bio = profile.bio.trim()

  return (
    <YStack
      flex={1}
      alignItems="center"
      backgroundColor="$background"
      paddingHorizontal="$4"
      paddingTop="$8"
      paddingBottom="$6"
    >
      <YStack width="100%" maxWidth={468} alignItems="center" gap="$5" alignSelf="center">
        <Avatar circular size="$10" borderWidth={1} borderColor="$borderColor">
          {profile.avatar ? <Avatar.Image src={profile.avatar} accessibilityLabel={name} /> : null}
          <Avatar.Fallback alignItems="center" justifyContent="center" backgroundColor="$color2">
            <Text fontSize="$9" fontWeight="700" color="$color">
              {monogram(name)}
            </Text>
          </Avatar.Fallback>
        </Avatar>

        <YStack alignItems="center" gap="$2">
          <H1 fontSize="$9" fontWeight="800" letterSpacing={-0.5} textAlign="center" color="$color">
            {name}
          </H1>
          {bio ? (
            <Paragraph textAlign="center" opacity={0.6} maxWidth={384} color="$color">
              {bio}
            </Paragraph>
          ) : null}
        </YStack>

        <YStack width="100%" gap="$3">
          {links.map((link, i) => {
            const cap = host(link.url)
            return (
              <Button
                key={link.id ?? i}
                height={64}
                paddingVertical="$2"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$7"
                hoverStyle={{ borderColor: '$color', backgroundColor: '$color1' }}
                pressStyle={{ opacity: 0.9, backgroundColor: '$color2' }}
                onPress={() => {
                  onTap?.(link)
                  open(link.url)
                }}
              >
                <YStack alignItems="center" justifyContent="center" gap={2}>
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    {link.label}
                  </Text>
                  {cap ? (
                    <Text fontSize="$1" opacity={0.45} color="$color">
                      {cap}
                    </Text>
                  ) : null}
                </YStack>
              </Button>
            )
          })}
        </YStack>

        {footer}
      </YStack>
    </YStack>
  )
}
