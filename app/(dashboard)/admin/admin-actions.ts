'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient as createSsrClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  setUserStatus,
  deleteUserPermanently,
  createPlatformInvitation,
  cancelPlatformInvitation,
} from '@/services/admin.service'
import { deleteProject } from '@/services/projects.service'
import {
  sendUserApprovedNotification,
  sendUserRejectedNotification,
  sendPlatformInviteNotification,
} from '@/lib/email'
import type { ServiceResult } from '@/types/common.types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function requireSuperAdmin() {
  const ssrClient = await createSsrClient()
  const { data: { user } } = await ssrClient.auth.getUser()
  if (!user) redirect('/login')

  const adminEmails =
    process.env.PLATFORM_ADMIN_EMAILS?.split(',')
      .map((e) => e.trim())
      .filter(Boolean) ?? []

  if (!user.email || !adminEmails.includes(user.email)) {
    redirect('/dashboard')
  }

  return user
}

export async function approveUserAction(userId: string, userEmail: string, userName: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await setUserStatus(supabase, userId, 'active')
  if (result.error) return result

  void sendUserApprovedNotification({ toEmail: userEmail, toName: userName })

  revalidatePath('/admin')
  return { data: null, error: null }
}

export async function rejectUserAction(userId: string, userEmail: string, userName: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await setUserStatus(supabase, userId, 'rejected')
  if (result.error) return result

  void sendUserRejectedNotification({ toEmail: userEmail, toName: userName })

  revalidatePath('/admin')
  return { data: null, error: null }
}

export async function suspendUserAction(userId: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await setUserStatus(supabase, userId, 'suspended')
  if (!result.error) revalidatePath('/admin')
  return result
}

export async function reactivateUserAction(userId: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await setUserStatus(supabase, userId, 'active')
  if (!result.error) revalidatePath('/admin')
  return result
}

export async function deleteUserAction(userId: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await deleteUserPermanently(supabase, userId)
  if (!result.error) revalidatePath('/admin')
  return result
}

export async function invitePlatformUserAction(email: string): Promise<ServiceResult<null>> {
  const admin = await requireSuperAdmin()
  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', admin.id)
    .single()

  const result = await createPlatformInvitation(supabase, email, admin.id)
  if (result.error) return { data: null, error: result.error }

  void sendPlatformInviteNotification({
    toEmail: email,
    invitedByName: adminProfile?.full_name ?? 'An administrator',
    inviteUrl: `${APP_URL}/accept-platform-invite?token=${result.data!.token}`,
  })

  revalidatePath('/admin')
  return { data: null, error: null }
}

export async function cancelPlatformInvitationAction(id: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await cancelPlatformInvitation(supabase, id)
  if (!result.error) revalidatePath('/admin')
  return result
}

export async function deleteProjectAdminAction(projectId: string): Promise<ServiceResult<null>> {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const result = await deleteProject(supabase, projectId)
  if (!result.error) revalidatePath('/admin')
  return result
}
