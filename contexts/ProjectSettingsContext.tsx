'use client'

import { createContext, useContext } from 'react'
import type { ProjectStatus, ProjectIssueType, ProjectLabel } from '@/types/project-settings.types'

interface ProjectSettingsContextValue {
  statuses: ProjectStatus[]
  types: ProjectIssueType[]
  labels: ProjectLabel[]
}

const ProjectSettingsContext = createContext<ProjectSettingsContextValue>({
  statuses: [],
  types: [],
  labels: [],
})

export function ProjectSettingsProvider({
  statuses,
  types,
  labels,
  children,
}: {
  statuses: ProjectStatus[]
  types: ProjectIssueType[]
  labels: ProjectLabel[]
  children: React.ReactNode
}) {
  return (
    <ProjectSettingsContext.Provider value={{ statuses, types, labels }}>
      {children}
    </ProjectSettingsContext.Provider>
  )
}

export function useProjectSettings() {
  return useContext(ProjectSettingsContext)
}

export function formatSettingLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
