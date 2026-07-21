import { useIam } from '@hanzo/iam/react'
import { YStack, Separator, Text, Button } from '@hanzo/gui'
import { PageView } from '../components/page-view'
import { DEMO_PROFILE, DEMO_LINKS } from '../lib/page'

/**
 * The landing — the public link page rendered live from demo content, so you
 * see exactly what you get before signing in. One action: PKCE sign-in with
 * Hanzo (hanzo.id). There is no local credential form; Hanzo IAM owns every
 * credential interaction. On sign-in this same page fills with your own rows.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <PageView
        profile={DEMO_PROFILE}
        links={DEMO_LINKS}
        footer={
        <YStack width="100%" alignItems="center" gap="$4" paddingTop="$5">
          <Separator width="100%" borderColor="$borderColor" />
          <Text fontSize="$2" opacity={0.5} textAlign="center" color="$color">
            A live preview — this is your page.
          </Text>
          <Button
            size="$5"
            theme="active"
            width="100%"
            disabled={isLoading}
            onPress={() => login()}
          >
            {isLoading ? 'Loading…' : 'Make it yours — sign in'}
          </Button>
          <Text fontSize="$1" opacity={0.4} textAlign="center" color="$color">
            Link Onepage · yours to own, on Hanzo
          </Text>
        </YStack>
        }
      />
    </YStack>
  )
}
