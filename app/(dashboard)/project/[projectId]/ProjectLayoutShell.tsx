'use client'

import { usePathname } from 'next/navigation'

interface Props {
  children: React.ReactNode
  header: React.ReactNode
}

export function ProjectLayoutShell({ children, header }: Props) {
  const pathname = usePathname()
  const isIssuePage = /\/issue\/[^/]+/.test(pathname)

  if (isIssuePage) {
    return <div className="flex-1 overflow-auto">{children}</div>
  }

  return (
    <div className="flex flex-col h-full">
      {header}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
