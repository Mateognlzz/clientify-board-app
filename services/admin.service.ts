import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { ServiceResult } from '@/types/common.types'

type Client = SupabaseClient<Database>

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  status: string
  created_at: string
}

export interface PlatformInvitation {
  id: string
  email: string
  token: string
  invited_by: string
  created_at: string
  expires_at: string
  accepted_at: string | null
}

export interface AdminActionToken {
  id: string
  token: string
  action: string
  target_user_id: string
  created_at: string
  expires_at: string
  used_at: string | null
  target_user: { email: string; full_name: string | null } | null
}

export async function listAllUsers(supabase: Client): Promise<ServiceResult<AdminUser[]>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, status, created_at')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: 'Error loading users.' }
  return { data: data as AdminUser[], error: null }
}

export async function listUsersByStatus(supabase: Client, status: string): Promise<ServiceResult<AdminUser[]>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, status, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: 'Error loading users.' }
  return { data: data as AdminUser[], error: null }
}

export async function setUserStatus(supabase: Client, userId: string, status: string): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) return { data: null, error: 'Error updating user status.' }
  return { data: null, error: null }
}

export async function deleteUserPermanently(supabase: Client, userId: string): Promise<ServiceResult<null>> {
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId)
  if (profileError) return { data: null, error: 'Error deleting user.' }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) console.error('[deleteUser] Auth delete failed:', authError.message)

  return { data: null, error: null }
}

export async function createAdminActionTokens(
  supabase: Client,
  targetUserId: string
): Promise<{ approveToken: string | null; rejectToken: string | null }> {
  const [approveResult, rejectResult] = await Promise.all([
    supabase
      .from('admin_action_tokens')
      .insert({ action: 'approve', target_user_id: targetUserId })
      .select('token')
      .single(),
    supabase
      .from('admin_action_tokens')
      .insert({ action: 'reject', target_user_id: targetUserId })
      .select('token')
      .single(),
  ])

  return {
    approveToken: approveResult.data?.token ?? null,
    rejectToken: rejectResult.data?.token ?? null,
  }
}

export async function getAdminActionToken(
  supabase: Client,
  token: string
): Promise<ServiceResult<AdminActionToken>> {
  const { data, error } = await supabase
    .from('admin_action_tokens')
    .select(`
      id, token, action, target_user_id, created_at, expires_at, used_at,
      target_user:profiles!admin_action_tokens_target_user_id_fkey(email, full_name)
    `)
    .eq('token', token)
    .single()

  if (error || !data) return { data: null, error: 'Token not found.' }
  return { data: data as unknown as AdminActionToken, error: null }
}

export async function markAdminTokenUsed(supabase: Client, tokenId: string): Promise<void> {
  await supabase
    .from('admin_action_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)
}

export interface AdminProject {
  id: string
  name: string
  key: string
  description: string | null
  created_at: string
  owner: { id: string; full_name: string | null; email: string; avatar_url: string | null; status: string } | null
  member_count: number
  issue_count: number
}

export async function getAllProjects(supabase: Client): Promise<ServiceResult<AdminProject[]>> {
  const { data: projectsData, error } = await supabase
    .from('projects')
    .select('id, name, key, description, created_at, owner:profiles!projects_owner_id_fkey(id, full_name, email, avatar_url, status)')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: 'Error loading projects.' }
  if (!projectsData || projectsData.length === 0) return { data: [], error: null }

  const projectIds = projectsData.map((p) => p.id)

  const [{ data: membersData }, { data: issuesData }] = await Promise.all([
    supabase.from('project_members').select('project_id').in('project_id', projectIds),
    supabase.from('issues').select('project_id').in('project_id', projectIds),
  ])

  const memberCount = (membersData ?? []).reduce<Record<string, number>>((acc, m) => {
    acc[m.project_id] = (acc[m.project_id] ?? 0) + 1
    return acc
  }, {})

  const issueCount = (issuesData ?? []).reduce<Record<string, number>>((acc, i) => {
    acc[i.project_id] = (acc[i.project_id] ?? 0) + 1
    return acc
  }, {})

  const projects: AdminProject[] = projectsData.map((p) => ({
    id: p.id,
    name: p.name as string,
    key: p.key as string,
    description: p.description as string | null,
    created_at: p.created_at as string,
    owner: (p as unknown as { owner: AdminProject['owner'] }).owner,
    member_count: memberCount[p.id] ?? 0,
    issue_count: issueCount[p.id] ?? 0,
  }))

  return { data: projects, error: null }
}

export async function getPlatformInvitations(supabase: Client): Promise<ServiceResult<PlatformInvitation[]>> {
  const { data, error } = await supabase
    .from('platform_invitations')
    .select('*')
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: 'Error loading invitations.' }
  return { data: data as PlatformInvitation[], error: null }
}

export async function createPlatformInvitation(
  supabase: Client,
  email: string,
  invitedBy: string
): Promise<ServiceResult<PlatformInvitation>> {
  const { data: existing } = await supabase
    .from('platform_invitations')
    .select('id, expires_at, accepted_at')
    .eq('email', email)
    .single()

  if (existing) {
    const isExpired = new Date(existing.expires_at) < new Date()
    if (!isExpired && !existing.accepted_at) {
      return { data: null, error: 'There is already a pending invitation for this email.' }
    }
    await supabase.from('platform_invitations').delete().eq('id', existing.id)
  }

  const { data, error } = await supabase
    .from('platform_invitations')
    .insert({ email, invited_by: invitedBy })
    .select()
    .single()

  if (error) return { data: null, error: 'Error creating invitation.' }
  return { data: data as PlatformInvitation, error: null }
}

export async function cancelPlatformInvitation(supabase: Client, id: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('platform_invitations').delete().eq('id', id)
  if (error) return { data: null, error: 'Error cancelling invitation.' }
  return { data: null, error: null }
}

export async function getPlatformInvitationByToken(
  supabase: Client,
  token: string
): Promise<ServiceResult<PlatformInvitation & { inviter: { full_name: string | null } | null }>> {
  const { data, error } = await supabase
    .from('platform_invitations')
    .select('*, inviter:profiles!platform_invitations_invited_by_fkey(full_name)')
    .eq('token', token)
    .single()

  if (error || !data) return { data: null, error: 'Invitation not found.' }
  return {
    data: data as unknown as PlatformInvitation & { inviter: { full_name: string | null } | null },
    error: null,
  }
}

export async function acceptPlatformInvitation(
  supabase: Client,
  token: string,
  userId: string,
  userEmail: string
): Promise<ServiceResult<null>> {
  const { data: inv, error } = await supabase
    .from('platform_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !inv) return { data: null, error: 'Invitation not found.' }
  if (inv.accepted_at) return { data: null, error: 'Invitation already accepted.' }
  if (new Date(inv.expires_at) < new Date()) return { data: null, error: 'Invitation has expired.' }
  if (inv.email.toLowerCase() !== userEmail.toLowerCase()) {
    return { data: null, error: `This invitation was sent to ${inv.email}.` }
  }

  await Promise.all([
    supabase.from('profiles').update({ status: 'active' }).eq('id', userId),
    supabase.from('platform_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', inv.id),
  ])

  return { data: null, error: null }
}
