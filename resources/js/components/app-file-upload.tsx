import React, { useRef, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Paperclip,
  PlusIcon,
  Upload,
  LoaderCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppFileUploadProps {
  workspaceId: string;
  mediableId: string;
  mediableType?: string;
  showPlaceholder?: boolean;
  variant?: 'icon' | 'tile';
  accept?: string;
  className?: string;
}

export default function AppFileUpload({
  workspaceId,
  mediableId,
  mediableType = 'task',
  showPlaceholder = false,
  variant = 'icon',
  accept = 'image/*',
  className,
}: AppFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const openFilePicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || isUploading) return;

    const toastId = toast.loading(`Uploading file... ${progress}%`);
    setIsUploading(true);
    setProgress(0);

    try {
      const { data } = await axios.post(route('s3.upload'), {
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
      });

      await axios.put(data.signed_url, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );
            setProgress(percent);
            toast.loading(`Uploading file... ${percent}%`, {
              id: toastId,
            });
          }
        },
      });

      router.post(
        route('media.upload'),
        {
          path: data.path,
          filename: data.filename,
          original_filename: data.original_filename,
          filetype: file.type,
          filesize: file.size,
          workspace_id: workspaceId,
          mediable_id: mediableId,
          mediable_type: mediableType,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('File uploaded successfully', {
              id: toastId,
            });
          },
          onError: () => {
            toast.error('Failed to save file metadata', {
              id: toastId,
            });
          },
          onFinish: () => {
            setIsUploading(false);
            setProgress(0);
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', { id: toastId });
      setIsUploading(false);
      setProgress(0);
    } finally {
      e.target.value = '';
    }
  };

  if (variant === 'tile') {
    return (
      <>
        <button
          type="button"
          disabled={isUploading}
          onClick={openFilePicker}
          className={cn(
            'flex min-h-[132px] w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-neutral-400 hover:bg-muted/40 hover:text-foreground disabled:opacity-60',
            className
          )}
        >
          {isUploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
          <span className="text-[12px] font-medium">
            {isUploading ? `Uploading ${progress}%` : 'Add file'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isUploading}
            className={className ?? 'h-9 w-9'}
          >
            {isUploading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : showPlaceholder ? (
              <PlusIcon className="h-4 w-4" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-1">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              openFilePicker();
            }}
            disabled={isUploading}
            className="gap-2.5 rounded-md px-2 py-2 text-[13px]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40">
              {isUploading ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {isUploading ? 'Uploading…' : 'Upload file'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isUploading
                  ? `${progress}% complete`
                  : 'From your computer'}
              </p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </>
  );
}
