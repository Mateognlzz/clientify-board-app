'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: ModalSize
  externalHref?: string
}

const SIZE_STYLES: Record<ModalSize, string> = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-2xl',
  '2xl': 'max-w-5xl',
}

export function Modal({ open, onClose, title, children, size = 'md', externalHref }: ModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white rounded-xl shadow-xl',
          SIZE_STYLES[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2
            id="modal-title"
            className="text-base font-semibold text-gray-900 truncate pr-4"
          >
            {title}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            {externalHref && (
              <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[82vh]">{children}</div>
      </div>
    </div>,
    document.body
  )
}
