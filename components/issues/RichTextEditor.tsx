'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import ImageExtension from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { createLowlight, common } from 'lowlight'
import { Image as ImageIcon } from 'lucide-react'
import type { JSONContent } from '@tiptap/core'
import type { ProjectMemberPreview } from '@/services/projects.service'
import { MentionList, type MentionListHandle } from '@/components/issues/MentionList'

const lowlight = createLowlight(common)

export function buildDisplayExtensions() {
  return [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.configure({ lowlight }),
    ImageExtension.configure({ inline: false, allowBase64: true }),
    Mention.configure({ HTMLAttributes: { class: 'mention-chip' } }),
  ]
}

function buildEditorExtensions(
  membersRef: React.MutableRefObject<ProjectMemberPreview[]>,
  placeholder: string,
) {
  return [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.configure({ lowlight }),
    ImageExtension.configure({ inline: false, allowBase64: true }),
    Placeholder.configure({ placeholder }),
    Mention.configure({
      HTMLAttributes: { class: 'mention-chip' },
      suggestion: {
        items: ({ query }: { query: string }) =>
          membersRef.current
            .filter((m) => (m.profile?.full_name ?? '').toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8),
        render: () => {
          let renderer: ReactRenderer<MentionListHandle>
          let container: HTMLDivElement
          return {
            onStart: (props) => {
              renderer = new ReactRenderer(MentionList, { props, editor: props.editor })
              container = document.createElement('div')
              container.style.cssText = 'position:fixed;z-index:9999'
              document.body.appendChild(container)
              container.appendChild(renderer.element)
              const rect = props.clientRect?.()
              if (rect) { container.style.top = `${rect.bottom + 6}px`; container.style.left = `${rect.left}px` }
            },
            onUpdate: (props) => {
              renderer.updateProps(props)
              const rect = props.clientRect?.()
              if (rect && container) { container.style.top = `${rect.bottom + 6}px`; container.style.left = `${rect.left}px` }
            },
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') { container?.remove(); return true }
              return renderer.ref?.onKeyDown(event) ?? false
            },
            onExit: () => { container?.remove(); renderer.destroy() },
          }
        },
      },
    }),
  ]
}

/** Parse a stored description: JSON string → JSONContent, plain text → paragraph node */
export function parseDescription(raw: string | null): JSONContent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.type === 'doc') return parsed as JSONContent
  } catch { /* plain text */ }
  // Wrap plain text in a doc so Tiptap can render it
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: raw }] }] }
}

export function renderDescriptionHTML(raw: string | null): string {
  const json = parseDescription(raw)
  if (!json) return ''
  try {
    return generateHTML(json, buildDisplayExtensions())
  } catch { return '' }
}

interface RichTextEditorProps {
  initialContent: JSONContent | null
  members: ProjectMemberPreview[]
  placeholder?: string
  uploadImage: (file: File) => Promise<string | null>
  onReady?: (getJson: () => JSONContent) => void
  minHeight?: string
}

export function RichTextEditor({
  initialContent,
  members,
  placeholder = 'Write something… use @ to mention someone',
  uploadImage,
  onReady,
  minHeight = '120px',
}: RichTextEditorProps) {
  const membersRef = useRef(members)
  useEffect(() => { membersRef.current = members }, [members])

  const imageInputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const extensions = useMemo(() => buildEditorExtensions(membersRef, placeholder), [placeholder])

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        class: `tiptap-content focus:outline-none px-3 py-2 text-gray-900 text-sm`,
        style: `min-height: ${minHeight}`,
      },
    },
  })

  useEffect(() => {
    if (editor && onReady) onReady(() => editor.getJSON())
  }, [editor, onReady])

  async function handleImageFile(file: File) {
    if (uploadingRef.current) return
    uploadingRef.current = true
    const src = await uploadImage(file)
    uploadingRef.current = false
    if (src) editor?.chain().focus().setImage({ src }).run()
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <TB onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} label="B" cls="font-bold" title="Bold" />
        <TB onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} label="I" cls="italic" title="Italic" />
        <TB onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} label="<>" cls="font-mono text-xs" title="Inline code" />
        <TB onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} label="{ }" cls="font-mono text-xs" title="Code block" />
        <button
          type="button"
          title="Attach image"
          onClick={() => imageInputRef.current?.click()}
          className="px-2 py-0.5 text-sm rounded text-gray-500 hover:bg-gray-100"
        >
          <ImageIcon size={14} />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageFile(file)
            e.target.value = ''
          }}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function TB({ onClick, active, label, cls, title }: {
  onClick: () => void; active?: boolean; label: string; cls?: string; title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-0.5 text-sm rounded transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'} ${cls ?? ''}`}
    >
      {label}
    </button>
  )
}
