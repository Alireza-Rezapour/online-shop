"use client";

import { uploadFileToS3 } from "@/lib/upload-file";
import { useGetPresignedUploadUrlMutation } from "@/redux/baseApi";

export default function ImageUploader() {
  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
      }).unwrap();

      await uploadFileToS3(file, uploadUrl);

      console.log("Uploaded:", publicUrl);
    } catch (error) {
      console.error(error);
    }
  };

  return <input type="file" accept="image/*" onChange={handleUpload} />;
}
