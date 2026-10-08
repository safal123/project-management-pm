import { useMemo, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Download,
  X,
  Plus,
  Minus,
  Trash2,
  LoaderCircle,
  FileText,
} from 'lucide-react'
import { formatFileSize, formatShortDate, isImageFile } from '@/utils/app-utils'
import axios from 'axios'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'

interface AppImagePreviewProps {
  url: string
  alt?: string
  filename?: string
  className?: string
  createdAt?: string
  mediaId?: string
  filesize?: number | string
  filetype?: string
}

const ZOOM_STEP = 0.25
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

const AppImagePreview = ({
  url,
  alt = 'Attachment preview',
  className,
  filename,
  createdAt,
  mediaId,
  filesize,
  filetype,
}: AppImagePreviewProps) => {
  const [imageUrl, setImageUrl] = useState(url)
  const [zoom, setZoom] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const image = isImageFile(filetype, filename)
  const sizeLabel = formatFileSize(filesize)
  const dateLabel = createdAt ? formatShortDate(createdAt) : ''

  const imageStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: 'center center',
    }),
    [zoom]
  )

  const refreshImageUrl = async () => {
    if (!mediaId || refreshing) return

    try {
      setRefreshing(true)
      const { data } = await axios.get(route('media.get-url', { media: mediaId }))
      if (data?.media?.url) {
        setImageUrl(data.media.url)
      }
    } catch (error) {
      console.error('Failed to refresh image URL', error)
    } finally {
      setRefreshing(false)
    }
  }

  const deleteImage = () => {
    if (!mediaId) return
    router.delete(route('media.delete', { media: mediaId }), {
      preserveScroll: true,
      onStart: () => setDeleting(true),
      onSuccess: () => toast.success('Attachment removed'),
      onError: () => toast.error('Failed to remove attachment'),
      onFinish: () => setDeleting(false),
    })
  }

  const download = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename ?? 'attachment'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'group flex w-full cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-background text-left shadow-sm transition-colors hover:border-neutral-300 dark:hover:border-white/20',
            className
          )}
        >
          <div className="relative flex h-28 items-center justify-center bg-muted/50">
            {image ? (
              <img
                src={imageUrl}
                alt={alt}
                onError={refreshImageUrl}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText className="h-7 w-7 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-start justify-end gap-0.5 bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/25 group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  download()
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  deleteImage()
                }}
              >
                {deleting ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="border-t border-border px-2 py-1.5">
            <p className="truncate text-[12px] font-medium">{filename ?? 'Attachment'}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {[sizeLabel, dateLabel].filter(Boolean).join(' · ') || 'File'}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="z-[9998] bg-neutral-950/80" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 p-0 text-neutral-100 outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">{filename ?? alt}</DialogTitle>
          <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{filename ?? 'Attachment'}</p>
              <p className="truncate text-[11px] text-neutral-400">
                {[sizeLabel, dateLabel].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {image && (
                <div className="mr-1 flex items-center overflow-hidden rounded-md border border-white/15">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none text-neutral-200 hover:bg-white/10"
                    onClick={() => setZoom((value) => Math.max(value - ZOOM_STEP, MIN_ZOOM))}
                    disabled={zoom <= MIN_ZOOM}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-10 text-center text-[11px] text-neutral-300">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none text-neutral-200 hover:bg-white/10"
                    onClick={() => setZoom((value) => Math.min(value + ZOOM_STEP, MAX_ZOOM))}
                    disabled={zoom >= MAX_ZOOM}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[13px] text-neutral-200 hover:bg-white/10"
                onClick={download}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-200 hover:bg-white/10"
                disabled={deleting}
                onClick={deleteImage}
              >
                {deleting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-200 hover:bg-white/10">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
            {image ? (
              <img
                src={imageUrl}
                alt={alt}
                onError={refreshImageUrl}
                className="max-h-full max-w-full object-contain transition-transform duration-200 ease-out"
                style={imageStyle}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-300">
                <FileText className="h-10 w-10" />
                <p className="text-[13px]">{filename ?? 'This file cannot be previewed'}</p>
                <Button size="sm" className="h-8 px-3 text-[13px]" onClick={download}>
                  Download file
                </Button>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export default AppImagePreview
