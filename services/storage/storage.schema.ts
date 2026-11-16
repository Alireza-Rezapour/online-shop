import { z } from "zod";
import { UploadPurpose } from "./storage.types";

export const RequestUploadUrlSchema = z.object({
  purpose: z.nativeEnum(UploadPurpose),
  mimeType: z.string().trim().min(1),
});
export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
