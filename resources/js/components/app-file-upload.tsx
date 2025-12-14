import React, { useRef, useState } from 'react';
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
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface AppFileUploadProps {
  workspaceId: string;
  mediableId: string;
  mediableType?: string;
  className?: string;
  showPlaceholder?: boolean;
  accept?: string;
}

export default function AppFileUpload({
  workspaceId,
  mediableId,
  mediableType = 'task',
  showPlaceholder = false,
  accept = "image/*"
}: AppFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.loading('Uploading file...');
    const files = e.target.files;
    if (files?.length) {
      try {
        setIsUploading(true);
        const response = await axios.post(route('s3.upload'), {
          filename: files[0].name,
          file_type: files[0].type,
          file_size: files[0].size,
        })
        const signedUrl = response.data.signed_url;
        await axios.put(signedUrl, files[0]);
        router.post(route('media.upload'), {
          path: response.data.path,
          filename: response.data.filename,
          original_filename: response.data.original_filename,
          filetype: files[0].type,
          filesize: files[0].size,
          workspace_id: workspaceId,
          mediable_id: mediableId,
          mediable_type: mediableType,
        }, {
          onFinish: () => {
            setIsUploading(false);
            toast.success('File uploaded successfully');
          },
        })
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
        toast.error('Upload failed');
      } finally {
        toast.dismiss();
      }
    }
    e.target.value = '';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-fit" disabled={isUploading}>
            {isUploading && showPlaceholder ? (
              <Button className="flex items-center gap-2 border rounded-md px-12">
                <LoaderCircle className="h-4 w-4 animate-spin" />
              </Button>
            ) : showPlaceholder ? (
              <div
                role="button"
                className="h-12 w-12 flex items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground hover:bg-muted cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
              </div>
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            <span className="sr-only">Attach file or link</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          {/* Upload from computer */}
          <DropdownMenuItem onSelect={openFilePicker} className="gap-3 py-3" disabled={isUploading}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {isUploading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{isUploading ? 'Uploading...' : 'Computer'}</p>
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Please wait' : 'Upload from your device'}
              </p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
    </>
  );
}

