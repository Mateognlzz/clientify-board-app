import { LoginClient } from './LoginClient'

interface Props {
  searchParams: Promise<{ inviteToken?: string; email?: string; platformInviteToken?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { inviteToken, email, platformInviteToken } = await searchParams
  return (
    <LoginClient
      inviteToken={inviteToken}
      defaultEmail={email}
      platformInviteToken={platformInviteToken}
    />
  )
}
