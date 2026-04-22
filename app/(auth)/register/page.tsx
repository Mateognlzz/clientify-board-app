import { RegisterClient } from './RegisterClient'

interface Props {
  searchParams: Promise<{ inviteToken?: string; email?: string; platformInviteToken?: string }>
}

export default async function RegisterPage({ searchParams }: Props) {
  const { inviteToken, email, platformInviteToken } = await searchParams
  return (
    <RegisterClient
      inviteToken={inviteToken}
      defaultEmail={email}
      platformInviteToken={platformInviteToken}
    />
  )
}
