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

interface AppFileUploadProps {
  workspaceId: string;
  mediableId: string;
  mediableType?: string;
  showPlaceholder?: boolean;
  accept?: string;
}

export default function AppFileUpload({
  workspaceId,
  mediableId,
  mediableType = 'task',
  showPlaceholder = false,
  accept = 'image/*',
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isUploading}
            className="h-9 w-9"
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

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              openFilePicker();
            }}
            disabled={isUploading}
            className="gap-3 py-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {isUploading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {isUploading ? 'Uploading...' : 'Computer'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isUploading
                  ? `Uploading ${progress}%`
                  : 'Upload from your device'}
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
