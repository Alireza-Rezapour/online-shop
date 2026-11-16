import { baseApi } from "../baseApi";
import type {
  PresignedUploadResult,
  UploadPurpose,
} from "@/services/storage/storage.types";

export interface RequestUploadUrlPayload {
  purpose: UploadPurpose;
  mimeType: string;
}

export const storageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestUploadUrl: builder.mutation<
      PresignedUploadResult,
      RequestUploadUrlPayload
    >({
      query: (body) => ({ url: "/storage/upload-url", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const { useRequestUploadUrlMutation } = storageApi;
