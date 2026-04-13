'use client'

import { createContext, useContext } from 'react'
import type { ProjectStatus, ProjectIssueType } from '@/types/project-settings.types'

interface ProjectSettingsContextValue {
  statuses: ProjectStatus[]
  types: ProjectIssueType[]
}

const ProjectSettingsContext = createContext<ProjectSettingsContextValue>({
  statuses: [],
  types: [],
})

export function ProjectSettingsProvider({
  statuses,
  types,
  children,
}: {
  statuses: ProjectStatus[]
  types: ProjectIssueType[]
  children: React.ReactNode
}) {
  return (
    <ProjectSettingsContext.Provider value={{ statuses, types }}>
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
