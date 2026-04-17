export interface ProjectStatus {
  id: string
  project_id: string
  name: string
  color: string
  position: number
  requires_pause_reason: boolean
  is_completed: boolean
  created_at: string
}

export interface ProjectIssueType {
  id: string
  project_id: string
  name: string
  color: string
  position: number
  created_at: string
}

export interface ProjectLabel {
  id: string
  project_id: string
  name: string
  color: string
  created_at: string
}
