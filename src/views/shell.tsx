import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text, Button } from '@hanzo/gui'
import { Page } from './page'
import { Editor } from './editor'
import { Analytics } from './analytics'

type Tab = 'page' | 'editor' | 'analytics'

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'page', label: 'Page' },
  { id: 'editor', label: 'Editor' },
  { id: 'analytics', label: 'Analytics' },
]

/**
 * The signed-in shell: a brand bar, the three-tab switch (Page · Editor ·
 * Analytics — the app's three views), and the active view below. No router —
 * one static SPA, tab state in memory, exactly like the auth gate in app.tsx.
 */
export function Shell() {
  const { user, logout } = useIam()
  const [tab, setTab] = useState<Tab>('page')
  const who = user?.displayName || user?.name || user?.email || 'you'

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize="$5" fontWeight="800" letterSpacing={-0.3} color="$color">Link Onepage</Text>
        <Button size="$2" chromeless onPress={() => logout()}>Sign out</Button>
      </XStack>

      <XStack
        gap="$1"
        padding="$2"
        justifyContent="center"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <Button
              key={t.id}
              size="$3"
              chromeless
              backgroundColor={active ? '$color2' : 'transparent'}
              onPress={() => setTab(t.id)}
            >
              <Text fontWeight={active ? '700' : '400'} opacity={active ? 1 : 0.6} color="$color">
                {t.label}
              </Text>
            </Button>
          )
        })}
      </XStack>

      <YStack flex={1}>
        {tab === 'page' ? (
          <Page onEdit={() => setTab('editor')} />
        ) : tab === 'editor' ? (
          <Editor />
        ) : (
          <Analytics onEdit={() => setTab('editor')} />
        )}
      </YStack>

      <XStack justifyContent="center" paddingVertical="$3" borderTopWidth={1} borderColor="$borderColor">
        <Text fontSize="$1" opacity={0.4} color="$color">Signed in as {who}</Text>
      </XStack>
    </YStack>
  )
}
