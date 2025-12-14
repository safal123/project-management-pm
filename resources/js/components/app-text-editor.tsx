import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import debounce from 'lodash.debounce'
import 'quill/dist/quill.bubble.css'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
} from 'lucide-react'
import { router } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import AppTooltip from '@/components/app-tooltip'
import AppEmojiPicker from '@/components/app-emoji-picker'
import { cn } from '@/lib/utils'
import { Task } from '@/types'

interface AppTextEditorProps {
  task: Task
  className?: string
}

export default function AppTextEditor({ task, className }: AppTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)

  const [formats, setFormats] = useState<any>({})
  const [focused, setFocused] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)

  const save = debounce((html: string) => {
    router.patch(
      `/tasks/${task.id}`,
      { description: html },
      { preserveScroll: true }
    )
  }, 800)

  useEffect(() => {
    if (!editorRef.current) return

    const quill = new Quill(editorRef.current, {
      theme: 'bubble',
      placeholder: 'Write a description…',
      modules: { toolbar: false },
      formats: [
        'header',
        'bold',
        'italic',
        'underline',
        'list',
        'blockquote',
        'code-block',
      ],
    })

    quillRef.current = quill

    if (task.description) {
      quill.clipboard.dangerouslyPasteHTML(task.description)
    }

    quill.on('text-change', () => {
      const html =
        editorRef.current?.querySelector('.ql-editor')?.innerHTML ?? ''
      save(html)
    })

    quill.on('selection-change', range => {
      setFocused(!!range)
      if (range) setFormats(quill.getFormat(range))
    })

    return () => {
      save.cancel()
      quill.off('text-change')
      quill.off('selection-change')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggle = (name: string, value: any = true) => {
    const q = quillRef.current
    if (!q) return
    const current = q.getFormat()
    q.format(name, current[name] ? false : value)
  }

  const insertEmoji = (emoji: string) => {
    const q = quillRef.current
    if (!q) return

    if (!q.hasFocus()) q.focus()
    const range = q.getSelection(true)
    const index = range ? range.index : q.getLength()
    q.insertText(index, emoji)
    q.setSelection(index + emoji.length)
  }

  const tool = (
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void,
    label: string
  ) => (
    <AppTooltip content={label}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          'h-8 w-8',
          active
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {icon}
      </Button>
    </AppTooltip>
  )

  return (
    <div className={cn('w-full', className)}>
      <p className="text-sm mb-2">Description</p>

      <div
        className={cn(
          'rounded-lg border bg-card transition',
          focused
            ? 'border-primary ring-1 ring-primary/20'
            : 'border-input hover:border-primary/40'
        )}
      >
        {/* Editor */}
        <div className="p-3 min-h-[140px]">
          <div
            ref={editorRef}
            className={cn(
              '[&_.ql-editor]:p-0',
              '[&_.ql-editor]:prose [&_.ql-editor]:max-w-none',
              'dark:[&_.ql-editor]:prose-invert',
              '[&_.ql-editor.ql-blank::before]:text-muted-foreground'
            )}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-t bg-muted/40 p-1.5">
          {tool(<Heading1 className="h-4 w-4" />, formats.header === 1, () => toggle('header', 1), 'Heading 1')}
          {tool(<Heading2 className="h-4 w-4" />, formats.header === 2, () => toggle('header', 2), 'Heading 2')}

          {tool(<Bold className="h-4 w-4" />, formats.bold, () => toggle('bold'), 'Bold')}
          {tool(<Italic className="h-4 w-4" />, formats.italic, () => toggle('italic'), 'Italic')}
          {tool(<Underline className="h-4 w-4" />, formats.underline, () => toggle('underline'), 'Underline')}
          {tool(<Quote className="h-4 w-4" />, formats.blockquote, () => toggle('blockquote'), 'Quote')}

          <AppEmojiPicker
            open={emojiOpen}
            setOpen={setEmojiOpen}
            insertEmoji={insertEmoji}
          />

          {tool(<ListOrdered className="h-4 w-4" />, formats.list === 'ordered', () => toggle('list', 'ordered'), 'Numbered list')}
          {tool(<List className="h-4 w-4" />, formats.list === 'bullet', () => toggle('list', 'bullet'), 'Bullet list')}
          {tool(<Code className="h-4 w-4" />, formats['code-block'], () => toggle('code-block'), 'Code block')}
        </div>
      </div>
    </div>
  )
}
