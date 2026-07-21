import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import {
  YStack,
  XStack,
  H2,
  Text,
  Paragraph,
  Input,
  TextArea,
  Button,
  Separator,
  Spinner,
} from '@hanzo/gui'
import { PROFILE, LINKS, ordered, host, type Profile, type Link } from '../lib/page'

/** A labelled field — one consistent row of label + control. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <YStack gap="$2" width="100%">
      <Text fontSize="$2" opacity={0.6} color="$color">
        {label}
      </Text>
      {children}
    </YStack>
  )
}

/**
 * The Editor — the only place you change the page. Two sections against the
 * two Base collections: your profile (name · bio · avatar) and your links
 * (add · rename · reorder · remove). Every write carries the IAM token, so it
 * lands org-scoped; the Page and Analytics tabs read the same rows back.
 */
export function Editor() {
  const profileQ = useQuery<Profile>(PROFILE, { realtime: false })
  const linksQ = useQuery<Link>(LINKS, { realtime: false })
  const createProfile = useMutation(PROFILE, 'create')
  const updateProfile = useMutation(PROFILE, 'update')
  const createLink = useMutation(LINKS, 'create')
  const updateLink = useMutation(LINKS, 'update')
  const deleteLink = useMutation(LINKS, 'delete')

  const saved = profileQ.data[0]
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const seeded = useRef(false)

  useEffect(() => {
    if (!seeded.current && saved) {
      setName(saved.name)
      setBio(saved.bio)
      setAvatar(saved.avatar)
      seeded.current = true
    }
  }, [saved])

  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const links = ordered(linksQ.data)

  async function saveProfile() {
    const fields = { name: name.trim(), bio: bio.trim(), avatar: avatar.trim() }
    if (saved) await updateProfile.mutate({ id: saved.id, ...fields })
    else await createProfile.mutate(fields)
    await profileQ.refetch()
  }

  async function addLink() {
    const l = label.trim()
    const u = url.trim()
    if (!l || !u || createLink.isLoading) return
    const nextSort = linksQ.data.reduce((m, x) => Math.max(m, x.sort), -1) + 1
    await createLink.mutate({ label: l, url: u, sort: nextSort, clicks: 0 })
    setLabel('')
    setUrl('')
    await linksQ.refetch()
  }

  function startEdit(link: Link) {
    setEditId(link.id)
    setEditLabel(link.label)
    setEditUrl(link.url)
  }

  async function saveEdit() {
    if (!editId) return
    await updateLink.mutate({ id: editId, label: editLabel.trim(), url: editUrl.trim() })
    setEditId(null)
    await linksQ.refetch()
  }

  async function remove(id: string) {
    await deleteLink.mutate({ id })
    if (editId === id) setEditId(null)
    await linksQ.refetch()
  }

  async function move(index: number, dir: -1 | 1) {
    const a = links[index]
    const b = links[index + dir]
    if (!a || !b) return
    await Promise.all([
      updateLink.mutate({ id: a.id, sort: b.sort }),
      updateLink.mutate({ id: b.id, sort: a.sort }),
    ])
    await linksQ.refetch()
  }

  const profileDirty =
    !saved ||
    name.trim() !== saved.name ||
    bio.trim() !== saved.bio ||
    avatar.trim() !== saved.avatar

  return (
    <YStack width="100%" maxWidth={560} alignSelf="center" padding="$4" gap="$7">
      <YStack gap="$4">
        <H2 fontSize="$7" color="$color">Profile</H2>
        <Field label="Name">
          <Input value={name} placeholder="Your name" onChangeText={setName} />
        </Field>
        <Field label="Bio">
          <TextArea
            value={bio}
            placeholder="One or two lines about you."
            onChangeText={setBio}
            minHeight={84}
          />
        </Field>
        <Field label="Avatar image URL (optional)">
          <Input
            value={avatar}
            placeholder="https://…  (blank shows your initials)"
            autoCapitalize="none"
            onChangeText={setAvatar}
          />
        </Field>
        {(createProfile.error || updateProfile.error) ? (
          <Paragraph color="$red10">
            {(createProfile.error || updateProfile.error)?.message}
          </Paragraph>
        ) : null}
        <Button
          theme="active"
          alignSelf="flex-start"
          disabled={!profileDirty || createProfile.isLoading || updateProfile.isLoading}
          onPress={saveProfile}
        >
          {createProfile.isLoading || updateProfile.isLoading ? 'Saving…' : 'Save profile'}
        </Button>
      </YStack>

      <Separator borderColor="$borderColor" />

      <YStack gap="$4">
        <H2 fontSize="$7" color="$color">Links</H2>

        <XStack gap="$2" flexWrap="wrap">
          <Input
            flex={1}
            minWidth={140}
            value={label}
            placeholder="Label — e.g. Portfolio"
            onChangeText={setLabel}
          />
          <Input
            flex={2}
            minWidth={180}
            value={url}
            placeholder="URL or mailto:…"
            autoCapitalize="none"
            onChangeText={setUrl}
            onSubmitEditing={addLink}
          />
          <Button theme="active" disabled={!label.trim() || !url.trim() || createLink.isLoading} onPress={addLink}>
            Add
          </Button>
        </XStack>
        {createLink.error ? <Paragraph color="$red10">{createLink.error.message}</Paragraph> : null}

        {linksQ.isLoading ? (
          <XStack gap="$2" alignItems="center" opacity={0.6}>
            <Spinner /> <Text color="$color">Loading…</Text>
          </XStack>
        ) : links.length === 0 ? (
          <Paragraph opacity={0.6} color="$color">No links yet — add your first above.</Paragraph>
        ) : (
          <YStack gap="$2">
            {links.map((link, i) =>
              editId === link.id ? (
                <YStack
                  key={link.id}
                  gap="$2"
                  padding="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$5"
                >
                  <Input value={editLabel} placeholder="Label" onChangeText={setEditLabel} />
                  <Input
                    value={editUrl}
                    placeholder="URL"
                    autoCapitalize="none"
                    onChangeText={setEditUrl}
                    onSubmitEditing={saveEdit}
                  />
                  <XStack gap="$2" justifyContent="flex-end">
                    <Button size="$2" chromeless onPress={() => setEditId(null)}>Cancel</Button>
                    <Button size="$2" theme="active" disabled={!editLabel.trim() || !editUrl.trim() || updateLink.isLoading} onPress={saveEdit}>
                      Save
                    </Button>
                  </XStack>
                </YStack>
              ) : (
                <XStack
                  key={link.id}
                  alignItems="center"
                  gap="$3"
                  padding="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$5"
                >
                  <YStack flex={1} gap="$1">
                    <Text fontSize="$4" fontWeight="600" color="$color">{link.label}</Text>
                    <Text fontSize="$1" opacity={0.5} color="$color">{host(link.url) || link.url}</Text>
                  </YStack>
                  <XStack alignItems="center" gap="$1">
                    <Button size="$2" chromeless disabled={i === 0} onPress={() => move(i, -1)}>↑</Button>
                    <Button size="$2" chromeless disabled={i === links.length - 1} onPress={() => move(i, 1)}>↓</Button>
                    <Button size="$2" chromeless onPress={() => startEdit(link)}>Edit</Button>
                    <Button size="$2" chromeless disabled={deleteLink.isLoading} onPress={() => remove(link.id)}>Delete</Button>
                  </XStack>
                </XStack>
              ),
            )}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
