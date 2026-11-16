"use client";

import { uploadFileToPresignedUrl } from "@/lib/upload/upload-file";
import { useRequestSubmissionUploadUrlMutation } from "@/redux/services/storage.api";

/**
 * A student's own result photo. The server always uses
 * UploadPurpose.STUDENT_SUBMISSION_IMAGE and derives the uploader from the
 * session — the caller never picks a purpose or a path.
 */
export function useSubmissionUpload() {
  const [requestSubmissionUploadUrl] = useRequestSubmissionUploadUrlMutation();

  async function upload(
    file: File,
    courseId: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const presigned = await requestSubmissionUploadUrl({
      courseId,
      mimeType: file.type,
    }).unwrap();

    await uploadFileToPresignedUrl(
      presigned.uploadUrl,
      presigned.method,
      presigned.headers,
      file,
      onProgress,
    );

    return presigned.key;
  }

  return { upload };
}
