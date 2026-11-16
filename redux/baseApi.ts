import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),

  tagTypes: [
    "HERO_SLIDE",
    "Category",
    "SizeChart",
    "Attribute",
    "Color",
    "Product",
    "Carrier",
    "ORDER_ITEM",
    "ORDER",
    "PAYMENT",
    "SHIPMENT",
    "ADDRESS",
    "USER",
    "Favorite",
    "COLLECTION",
    "Review",
    "AdminReview",
    "ReviewEligibility",
    "Coupon",
  ],
  endpoints: () => ({}),
});
