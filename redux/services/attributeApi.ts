import { baseApi } from "@/redux/baseApi";
import type { AttributeDto } from "@/services/attribute/attribute.service";
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
} from "@/services/attribute/attribute.schema";

// Category responses embed their attributes, so they go stale when one changes
const categoryTags = [
  { type: "Category" as const, id: "LIST" },
  { type: "Category" as const, id: "TREE" },
];

export const attributeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAttributes: build.query<AttributeDto[], void>({
      query: () => "/attributes",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Attribute" as const, id })),
              { type: "Attribute" as const, id: "LIST" },
            ]
          : [{ type: "Attribute" as const, id: "LIST" }],
    }),

    getAttribute: build.query<AttributeDto, string>({
      query: (id) => `/attributes/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Attribute", id }],
    }),

    createAttribute: build.mutation<AttributeDto, CreateAttributeInput>({
      query: (body) => ({ url: "/attributes", method: "POST", body }),
      invalidatesTags: [{ type: "Attribute", id: "LIST" }],
    }),

    updateAttribute: build.mutation<
      AttributeDto,
      { id: string; data: UpdateAttributeInput }
    >({
      query: ({ id, data }) => ({
        url: `/attributes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Attribute", id },
        { type: "Attribute", id: "LIST" },
        ...categoryTags,
      ],
    }),

    deleteAttribute: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/attributes/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Attribute", id },
        { type: "Attribute", id: "LIST" },
        ...categoryTags,
      ],
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useGetAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} = attributeApi;
