import { getPublicUrl } from "@/services/storage/storage.public-url";

/**
 * Uploads a File straight to the bucket using a presigned URL.
 * Plain XHR (not fetch/RTK Query) so we get upload progress. The file goes
 * browser -> bucket directly, never through Next.js.
 *
 * Requires CORS on the bucket (PUT + Content-Type header) for your site's
 * origin, otherwise the browser blocks this request.
 */
export const resolveFileUrl = getPublicUrl;

export function uploadFileToPresignedUrl(
  uploadUrl: string,
  method: string,
  headers: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, uploadUrl, true);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`بارگذاری فایل ناموفق بود (کد ${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("خطا در ارتباط با فضای ذخیره‌سازی"));
    xhr.onabort = () => reject(new Error("بارگذاری لغو شد"));

    xhr.send(file);
  });
}
