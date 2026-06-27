import { type ReactNode, useState } from 'react'
import { KeyRound, LogOut } from 'lucide-react'
import { DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GoogleMark, GitHubMark } from './ProviderMarks'
import { useUser } from '../../context/UserContext'
import { useRegions } from '../../hooks/useRegions'
import { AGE_BANDS } from '../../types'
import {
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  BORDER_SUBTLE,
  BORDER_CONTROL,
  SURFACE_AVATAR
} from '../../theme'

export default function ProfilePanel({ onLogout }: { onLogout: () => void }) {
  const user = useUser()
  if (!user) return null

  return (
    <div className="flex flex-col">
      <ProfileHeader
        username={user.username}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
      <Demographics
        regionId={user.regionId}
        genderId={user.genderId}
        ageGroupId={user.ageGroupId}
      />
      <ConnectedAccounts provider={user.provider} />
      <Security />
      <LogoutFooter onLogout={onLogout} />
    </div>
  )
}

function ProfileHeader({
  username,
  email,
  avatarUrl
}: {
  username: string
  email: string
  avatarUrl: string | null
}) {
  return (
    <div className="flex items-center gap-4 px-6 pt-6 pb-5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${SURFACE_AVATAR}`}
        >
          {username[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <DialogTitle className={`text-lg font-semibold leading-tight ${TEXT_HEADING}`}>
          {username}
        </DialogTitle>
        <p className={`text-xs truncate ${TEXT_MUTED}`}>{email}</p>
      </div>
    </div>
  )
}

function Demographics({
  regionId,
  genderId,
  ageGroupId
}: {
  regionId: number | null
  genderId: number | null
  ageGroupId: number | null
}) {
  const { regions } = useRegions()
  const [draft, setDraft] = useState({ regionId, genderId, ageGroupId })

  const dirty =
    draft.regionId !== regionId ||
    draft.genderId !== genderId ||
    draft.ageGroupId !== ageGroupId

  return (
    <Section label="Profile">
      <div className="flex flex-col gap-3">
        <SelectRow
          label="Region"
          value={draft.regionId}
          options={regions.map((r) => ({ value: r.id, label: r.regionName }))}
          onChange={(value) => setDraft((d) => ({ ...d, regionId: value }))}
        />
        <SelectRow
          label="Gender"
          value={draft.genderId}
          options={[
            { value: 1, label: 'Men' },
            { value: 2, label: 'Women' }
          ]}
          onChange={(value) => setDraft((d) => ({ ...d, genderId: value }))}
        />
        <SelectRow
          label="Age group"
          value={draft.ageGroupId}
          options={AGE_BANDS.map((b) => ({ value: b.id, label: b.name }))}
          onChange={(value) => setDraft((d) => ({ ...d, ageGroupId: value }))}
        />
      </div>
      <p className={`text-xs leading-relaxed ${TEXT_MUTED}`}>
        These details will be used to surface data curated for your demographic
        in a future release. This feature is still in development.
      </p>
      {dirty && (
        <Button size="sm" className="self-end">
          Save changes
        </Button>
      )}
    </Section>
  )
}

function SelectRow({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: number | null
  options: { value: number; label: string }[]
  onChange: (value: number | null) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label className={`text-sm w-24 shrink-0 ${TEXT_MUTED}`}>{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
        className={`flex-1 h-8 rounded-lg border bg-transparent px-2 text-sm outline-none focus:border-gray-500 ${BORDER_CONTROL} ${TEXT_BODY}`}
      >
        <option value="">Not set</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ConnectedAccounts({ provider }: { provider: string | null }) {
  return (
    <Section label="Connected accounts">
      <div className="flex flex-col gap-2">
        <ProviderRow
          icon={<GoogleMark className="w-5 h-5" />}
          name="Google"
          connected={provider === 'google'}
        />
        <ProviderRow
          icon={<GitHubMark className="w-5 h-5" />}
          name="GitHub"
          connected={provider === 'github'}
        />
      </div>
      <p className={`text-xs leading-relaxed ${TEXT_MUTED}`}>
        Signing in or registering with another provider merges that account into
        the one you’re signed in to.
      </p>
    </Section>
  )
}

function ProviderRow({
  icon,
  name,
  connected
}: {
  icon: ReactNode
  name: string
  connected: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${BORDER_SUBTLE}`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={`text-sm font-medium ${TEXT_BODY}`}>{name}</span>
      </div>
      {connected ? (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="bg-muted text-teal-600 disabled:opacity-100"
        >
          Connected
        </Button>
      ) : (
        <Button variant="outline" size="sm">
          Connect
        </Button>
      )}
    </div>
  )
}

function Security() {
  return (
    <Section label="Security">
      <Button
        variant="outline"
        size="sm"
        disabled
        className="w-full justify-start gap-2"
      >
        <KeyRound /> Add a passkey
        <span className={`ml-auto text-xs ${TEXT_MUTED}`}>Coming soon</span>
      </Button>
    </Section>
  )
}

function LogoutFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className={`px-6 py-4 border-t ${BORDER_SUBTLE}`}>
      <Button
        variant="outline"
        onClick={onLogout}
        className="w-full justify-center gap-2"
      >
        <LogOut /> Log out
      </Button>
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={`flex flex-col gap-3 px-6 py-5 border-t ${BORDER_SUBTLE}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}>
        {label}
      </p>
      {children}
    </section>
  )
}
