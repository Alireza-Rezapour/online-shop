import { baseApi } from "@/redux/baseApi";
import type {
  CategoryDto,
  CategoryTreeNode,
} from "@/services/category/category.service";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/services/category/category.schema";

type GetCategoriesParams = {
  parentId?: string; // "root" for top-level only
  search?: string;
} | void;

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<CategoryDto[], GetCategoriesParams>({
      query: (params) => ({ url: "/categories", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    getCategoryTree: build.query<CategoryTreeNode[], void>({
      query: () => ({ url: "/categories", params: { tree: "true" } }),
      providesTags: [{ type: "Category", id: "TREE" }],
    }),

    getCategory: build.query<CategoryDto, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Category", id }],
    }),

    getCategoryBySlug: build.query<CategoryDto, string>({
      query: (slug) => `/categories/slug/${encodeURIComponent(slug)}`,
      providesTags: (result) =>
        result ? [{ type: "Category", id: result.id }] : [],
    }),

    createCategory: build.mutation<CategoryDto, CreateCategoryInput>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),

    updateCategory: build.mutation<
      CategoryDto,
      { id: string; data: UpdateCategoryInput }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),

    deleteCategory: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
