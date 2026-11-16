import { CartValidationDto } from "@/services/cart/validateCart.service";
import { baseApi } from "../baseApi";
import { CartValidationRequest } from "@/services/cart/cartValidation.schema";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // A POST used as a query: it reads, it never changes anything
    validateCart: builder.query<CartValidationDto, CartValidationRequest>({
      query: (body) => ({ url: "/cart/validate", method: "POST", body }),
    }),
  }),
});

export const { useValidateCartQuery } = cartApi;
