"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErrorToast from "@/lib/toast/error-toast";
import { useRequestUploadUrlMutation } from "@/redux/services/storageApi";

import {
  UPLOAD_PURPOSE_CONFIG,
  UploadPurpose,
} from "@/services/storage/storage.types";
import { uploadFileToPresignedUrl } from "@/lib/uploads/upload-file";
import { getPublicUrl } from "@/services/storage/storage.public-url";

interface FileUploadFieldProps {
  purpose: UploadPurpose;
  label: string;
  /** Current storage key (what gets saved with the form). */
  value: string | null;
  onChange: (key: string | null) => void;
  disabled?: boolean;
}

function formatMb(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

export function FileUploadField({
  purpose,
  label,
  value,
  onChange,
  disabled,
}: FileUploadFieldProps) {
  const { allowedMimeTypes, maxSizeBytes } = UPLOAD_PURPOSE_CONFIG[purpose];
  const inputRef = useRef<HTMLInputElement>(null);
  const [requestUploadUrl] = useRequestUploadUrlMutation();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Free the blob URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const displayPreview = value ? (localPreview ?? getPublicUrl(value)) : null;

  async function handleFile(file: File) {
    if (!allowedMimeTypes.includes(file.type)) {
      ErrorToast("فرمت فایل مجاز نیست (فقط WebP، PNG یا JPG)");
      return;
    }
    if (file.size > maxSizeBytes) {
      ErrorToast(
        `حجم فایل نباید بیشتر از ${formatMb(maxSizeBytes)} مگابایت باشد`,
      );
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const presigned = await requestUploadUrl({
        purpose,
        mimeType: file.type,
      }).unwrap();

      await uploadFileToPresignedUrl(
        presigned.uploadUrl,
        presigned.method,
        presigned.headers,
        file,
        setProgress,
      );

      setLocalPreview(URL.createObjectURL(file));
      onChange(presigned.key);
    } catch {
      ErrorToast("بارگذاری فایل ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={allowedMimeTypes.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {displayPreview && (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayPreview}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال بارگذاری... {progress}%
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              {value ? `تغییر ${label}` : `بارگذاری ${label}`}
            </>
          )}
        </Button>

        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-secondary"
            onClick={() => {
              onChange(null);
              setLocalPreview(null);
            }}
          >
            <X className="h-4 w-4" />
            حذف
          </Button>
        )}
      </div>
    </div>
  );
}
