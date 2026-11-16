import {
  HeroCtaType,
  HeroSlide,
} from "@/app/(admin)/components/hero/hero-types";
import { baseApi } from "../baseApi";
import type {
  CreateHeroSlideBody,
  UpdateHeroSlideBody,
} from "@/services/hero-slide/hero-slide.schema";

/** One option in the button-target picker. */
export interface HeroCtaOption {
  id: string;
  label: string;
  slug: string;
}

/** Admin responses also carry the picked target's name. */
export type AdminHeroSlide = HeroSlide & { ctaTarget: HeroCtaOption | null };

// Remember to add "HERO_SLIDE" to tagTypes in baseApi:
//   tagTypes: ["HERO_SLIDE", ...]

export const heroSlideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public, filtered by active + date window. Used by the storefront <Hero/>.
    getHeroSlides: builder.query<HeroSlide[], void>({
      query: () => "/hero-slides",
      providesTags: [{ type: "HERO_SLIDE", id: "LIST" }],
    }),

    // Admin, unfiltered. Used by the admin slides table.
    getAdminHeroSlides: builder.query<AdminHeroSlide[], void>({
      query: () => "/admin/hero-slides",
      providesTags: [{ type: "HERO_SLIDE", id: "ADMIN_LIST" }],
    }),

    getHeroSlide: builder.query<AdminHeroSlide, string>({
      query: (id) => `/admin/hero-slides/${id}`,
      providesTags: (_r, _e, id) => [{ type: "HERO_SLIDE", id }],
    }),

    // Options for the button-target picker (products / collections / categories)
    getHeroCtaOptions: builder.query<
      HeroCtaOption[],
      { type: HeroCtaType; search?: string }
    >({
      query: ({ type, search }) => ({
        url: "/admin/hero-slides/cta-options",
        params: { type, search },
      }),
    }),

    createHeroSlide: builder.mutation<HeroSlide, CreateHeroSlideBody>({
      query: (body) => ({ url: "/admin/hero-slides", method: "POST", body }),
      invalidatesTags: [
        { type: "HERO_SLIDE", id: "LIST" },
        { type: "HERO_SLIDE", id: "ADMIN_LIST" },
      ],
    }),

    updateHeroSlide: builder.mutation<
      HeroSlide,
      { id: string; body: UpdateHeroSlideBody }
    >({
      query: ({ id, body }) => ({
        url: `/admin/hero-slides/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "HERO_SLIDE", id },
        { type: "HERO_SLIDE", id: "LIST" },
        { type: "HERO_SLIDE", id: "ADMIN_LIST" },
      ],
    }),

    reorderHeroSlides: builder.mutation<
      { success: true },
      { items: { id: string; sortOrder: number }[] }
    >({
      query: (body) => ({
        url: "/admin/hero-slides/reorder",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        { type: "HERO_SLIDE", id: "LIST" },
        { type: "HERO_SLIDE", id: "ADMIN_LIST" },
      ],
    }),

    deleteHeroSlide: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/admin/hero-slides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "HERO_SLIDE", id },
        { type: "HERO_SLIDE", id: "LIST" },
        { type: "HERO_SLIDE", id: "ADMIN_LIST" },
      ],
    }),
  }),
});

export const {
  useGetHeroSlidesQuery,
  useGetAdminHeroSlidesQuery,
  useGetHeroSlideQuery,
  useGetHeroCtaOptionsQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useReorderHeroSlidesMutation,
  useDeleteHeroSlideMutation,
} = heroSlideApi;
