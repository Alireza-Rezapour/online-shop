import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addToCart,
  applyServerSnapshot,
  decreaseCart,
  increaseCart,
  removeAll,
  removeFromCart,
  saveCartToStorage,
  selectCartItems,
  setCartQty,
  type CartRootState,
} from "./slices/cartSlice";

export const cartListener = createListenerMiddleware();

// Saves after every cart change, in one place. populateCart is not listed on
// purpose: loading must never write back.
cartListener.startListening({
  matcher: isAnyOf(
    addToCart,
    increaseCart,
    decreaseCart,
    removeFromCart,
    setCartQty,
    removeAll,
    applyServerSnapshot,
  ),
  effect: (_action, api) => {
    saveCartToStorage(selectCartItems(api.getState() as CartRootState));
  },
});
