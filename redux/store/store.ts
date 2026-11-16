import { configureStore } from "@reduxjs/toolkit";

import { cartSlice } from "../slices/cartSlice";
import { baseApi } from "../baseApi";
import { cartListener } from "../cartListener";

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(cartListener.middleware)
      .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
