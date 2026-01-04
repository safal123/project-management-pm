import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  XIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  LoaderCircle,
  RefreshCcwIcon
} from "lucide-react";
import { formatDueDate } from "@/utils/task";
import axios from "axios";
import { Badge } from "./ui/badge";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface AppImagePreviewProps {
  url: string;
  alt?: string;
  filename?: string;
  className?: string;
  createdAt?: string;
  mediaId?: string;
}

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const AppImagePreview = ({
  url,
  alt = "Image preview",
  className,
  filename,
  createdAt,
  mediaId,
}: AppImagePreviewProps) => {
  const [imageUrl, setImageUrl] = useState(url);
  const [zoom, setZoom] = useState(0.75);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const imageStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "center center",
    }),
    [zoom]
  );

  const refreshImageUrl = async () => {
    if (!mediaId || refreshing) return;

    try {
      setRefreshing(true);
      const { data } = await axios.get(
        route("media.get-url", { media: mediaId })
      );

      if (data?.media?.url) {
        setImageUrl(data.media.url);
      }
    } catch (error) {
      console.error("Failed to refresh image URL", error);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteImage = ({ mediaId }: { mediaId: string }) => {
    if (!mediaId) return;
    router.delete(route("media.delete", { media: mediaId }), {
      preserveScroll: true,
      onStart: () => {
        setDeleting(true);
      },
      onSuccess: () => {
        setDeleting(false);
        toast.success("Image deleted successfully");
        refreshImageUrl();
      },
      onError: () => {
        setDeleting(false);
        toast.error("Failed to delete image");
      },
      onFinish: () => {
        setDeleting(false);
      },
    });
  };

  const zoomIn = () =>
    setZoom((value) => Math.min(value + ZOOM_STEP, MAX_ZOOM));

  const zoomOut = () =>
    setZoom((value) => Math.max(value - ZOOM_STEP, MIN_ZOOM));

  const download = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename ?? "image";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imageUrl}
          alt={alt}
          onError={refreshImageUrl}
          className={cn(
            className,
            "w-12 h-12 rounded-md object-cover cursor-pointer border border-border"
          )}
        />
      </DialogTrigger>

      <DialogTitle className="sr-only">{alt}</DialogTitle>

      <DialogContent className="p-0 gap-0 min-w-screen h-[100vh] bg-background [&>button]:hidden z-[9999]">
        <div className="border-b bg-background min-h-[50px] max-h-fit py-2">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center h-14 px-4">
            <div className="hidden w-[400px] text-sm text-muted-foreground break-all leading-tight md:flex flex-col gap-1">
              {filename}
              <Badge variant="default" className="text-xs">
                Uploaded at: {formatDueDate(createdAt)?.text}
              </Badge>
            </div>

            <div className="ml-0 md:ml-auto flex items-center justify-center border w-fit mx-auto rounded-md">
              <Button
                variant="ghost"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="border-r rounded-none"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="border-r rounded-none ml-0"
                disabled
              >
                {/* In Percentage */}
                {zoom * 100}%
              </Button>
              <Button
                variant="ghost"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="border-r rounded-none ml-0"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={download}
                className="rounded-none"
              >
                <DownloadIcon className="h-4 w-4" />
                Download
              </Button>
              {/* Delete */}
              <Button
                variant="ghost"
                onClick={() => deleteImage({ mediaId: mediaId ?? '' })}
                className="rounded-none cursor-pointer"
                disabled={deleting}
              >
                {
                  deleting ?
                    <LoaderCircle className="h-4 w-4 animate-spin" /> :
                    <TrashIcon className="h-4 w-4" />
                }
              </Button>
              {/* Refresh */}
              <Button
                variant="ghost"
                onClick={refreshImageUrl}
                className="rounded-none cursor-pointer"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="default" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>

        <div className="flex items-center md:justify-center max-w-full mx-auto overflow-y-auto">
          <img
            src={imageUrl}
            alt={alt}
            onError={refreshImageUrl}
            className="max-h-[90vh] max-w-full object-contain transition-transform duration-200 ease-out border-2 border-primary/70 rounded-md"
            style={imageStyle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppImagePreview;
