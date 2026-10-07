import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, LoaderCircle, Trash2 } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Media } from '@/types';
import AppAvatar from '@/components/app-avatar';

interface AppProfilePictureUploadProps {
  workspaceId: string;
  userId: string;
  currentPicture?: Media | null;
  userName: string;
  className?: string;
}

export default function AppProfilePictureUpload({
  workspaceId,
  userId,
  currentPicture,
  userName,
  className,
}: AppProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      try {
        setIsUploading(true);
        toast.loading('Uploading profile picture...');

        const response = await axios.post(route('s3.upload'), {
          filename: files[0].name,
          file_type: files[0].type,
          file_size: files[0].size,
        });

        const signedUrl = response.data.signed_url;
        await axios.put(signedUrl, files[0]);

        router.post(
          route('media.upload'),
          {
            path: response.data.path,
            filename: response.data.filename,
            original_filename: response.data.original_filename,
            filetype: files[0].type,
            filesize: files[0].size,
            workspace_id: workspaceId,
            mediable_id: userId,
            mediable_type: 'user',
          },
          {
            onFinish: () => {
              setIsUploading(false);
              toast.dismiss();
              toast.success('Profile picture uploaded successfully');
            },
            onError: () => {
              setIsUploading(false);
              toast.dismiss();
              toast.error('Failed to upload profile picture');
            },
          }
        );
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
        toast.dismiss();
        toast.error('Upload failed');
      }
    }
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!currentPicture) return;

    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setIsDeleting(true);
      toast.loading('Removing profile picture...');

      router.delete(route('media.delete', currentPicture.id), {
        onFinish: () => {
          setIsDeleting(false);
          toast.dismiss();
          toast.success('Profile picture removed');
        },
        onError: () => {
          setIsDeleting(false);
          toast.dismiss();
          toast.error('Failed to remove profile picture');
        },
      });
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
      toast.dismiss();
      toast.error('Delete failed');
    }
  };

  return (
    <div className={cn('flex flex-col items-start gap-4 sm:flex-row sm:items-center', className)}>
      <div className="relative group flex-shrink-0">
        <AppAvatar
          src={currentPicture?.url}
          name={userName}
          size="2xl"
          className="ring-2 ring-border"
        />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading || isDeleting}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <LoaderCircle className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        <div>
          <h3 className="mb-0.5 text-[13px] font-medium">Profile Picture</h3>
          <p className="text-[11px] text-muted-foreground">
            Upload a professional photo. Accepted formats: JPG, PNG, GIF, or WEBP. Max size 5MB.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            disabled={isUploading || isDeleting}
            className="h-8 min-w-[100px] px-3 text-[13px]"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {currentPicture ? 'Change' : 'Upload'}
              </>
            )}
          </Button>

          {currentPicture && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="h-8 px-3 text-[13px] text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
      />
    </div>
  );
}

