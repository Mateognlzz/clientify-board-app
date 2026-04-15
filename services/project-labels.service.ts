import type { SupabaseClient } from '@supabase/supabase-js'
import type { ServiceResult } from '@/types/common.types'
import type { ProjectLabel } from '@/types/project-settings.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getProjectLabels(supabase: Client, projectId: string): Promise<ServiceResult<ProjectLabel[]>> {
  const { data, error } = await supabase
    .from('project_labels')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true })
  if (error) return { data: null, error: 'Error loading labels.' }
  return { data: data as ProjectLabel[], error: null }
}

export async function createProjectLabel(
  supabase: Client,
  projectId: string,
  name: string,
  color: string,
): Promise<ServiceResult<ProjectLabel>> {
  const { data, error } = await supabase
    .from('project_labels')
    .insert({ project_id: projectId, name: name.trim(), color })
    .select()
    .single()
  if (error) return { data: null, error: 'Error creating label.' }
  return { data: data as ProjectLabel, error: null }
}

export async function updateProjectLabel(
  supabase: Client,
  id: string,
  updates: { name?: string; color?: string },
): Promise<ServiceResult<ProjectLabel>> {
  const { data, error } = await supabase
    .from('project_labels')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: 'Error updating label.' }
  return { data: data as ProjectLabel, error: null }
}

export async function deleteProjectLabel(supabase: Client, id: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('project_labels').delete().eq('id', id)
  if (error) return { data: null, error: 'Error deleting label.' }
  return { data: null, error: null }
}

export async function getIssueLabels(supabase: Client, issueId: string): Promise<ServiceResult<ProjectLabel[]>> {
  const { data, error } = await supabase
    .from('issue_labels')
    .select('label:project_labels(*)')
    .eq('issue_id', issueId)
  if (error) return { data: null, error: 'Error loading issue labels.' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { data: (data ?? []).map((r: any) => r.label as ProjectLabel), error: null }
}

export async function setIssueLabels(supabase: Client, issueId: string, labelIds: string[]): Promise<ServiceResult<null>> {
  await supabase.from('issue_labels').delete().eq('issue_id', issueId)
  if (labelIds.length > 0) {
    const { error } = await supabase.from('issue_labels').insert(
      labelIds.map((label_id) => ({ issue_id: issueId, label_id }))
    )
    if (error) return { data: null, error: 'Error setting labels.' }
  }
  return { data: null, error: null }
}
