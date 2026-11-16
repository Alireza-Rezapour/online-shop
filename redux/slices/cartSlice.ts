import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { CartValidationItemDto } from "@/services/cart/validateCart.service";
import { CartItem } from "@/app/(main-app)/cart/types/types";
import {
  StoreProductCardDto,
  StoreProductCardVariantDto,
} from "@/services/product/store-product.service";

// The order API refuses more than this per item
export const MAX_QTY_PER_ITEM = 100;
export const CART_STORAGE_KEY = "cartItems";

const cartAdapter = createEntityAdapter<CartItem, string>({
  selectId: (item) => item.variantId,
});

export type CartProduct = StoreProductCardDto & {
  cartQty: number;
  selectedVariant: StoreProductCardVariantDto;
};

/* ----------------------------- storage ----------------------------- */

function isValidCartItem(value: unknown): value is CartItem {
  const item = value as CartItem | null;
  return (
    !!item &&
    typeof item.variantId === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.colorName === "string" &&
    typeof item.sizeName === "string" &&
    typeof item.price === "number" &&
    typeof item.availableStock === "number" &&
    Number.isInteger(item.cartQty) &&
    item.cartQty > 0
  );
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    // Carts saved by an older version or edited by hand are dropped, not fatal
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or blocked (private mode): the cart still works in memory
  }
}

/* ------------------------------ limits ----------------------------- */

function maxQty(item: Pick<CartItem, "availableStock">): number {
  return Math.min(MAX_QTY_PER_ITEM, Math.max(item.availableStock, 0));
}

function clampQty(qty: number, item: Pick<CartItem, "availableStock">): number {
  const whole = Number.isFinite(qty) ? Math.floor(qty) : 1;
  return Math.min(Math.max(whole, 1), Math.max(maxQty(item), 1));
}

/* ------------------------------- slice ------------------------------ */

const initialState = cartAdapter.getInitialState({
  // false until localStorage has been read, so the cart page can show a
  // skeleton instead of flashing "your cart is empty"
  hydrated: false,
  // What changed after the last check with the server, for the cart banner
  notices: { priceChanged: [] as string[], reduced: [] as string[] },
});

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    populateCart(state) {
      cartAdapter.setAll(state, loadCartFromStorage());
      state.hydrated = true;
    },

    addToCart(state, action: PayloadAction<CartItem>) {
      const item = action.payload;
      if (item.availableStock < 1) return; // out of stock

      const existing = state.entities[item.variantId];

      if (existing) {
        // Same variant again: add up, and refresh price and stock
        existing.price = item.price;
        existing.salePrice = item.salePrice;
        existing.availableStock = item.availableStock;
        existing.image = item.image;
        existing.cartQty = clampQty(existing.cartQty + item.cartQty, existing);
      } else {
        cartAdapter.addOne(state, {
          ...item,
          cartQty: clampQty(item.cartQty, item),
        });
      }
    },

    setCartQty(
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) {
      const item = state.entities[action.payload.variantId];
      if (item) item.cartQty = clampQty(action.payload.quantity, item);
    },

    increaseCart(state, action: PayloadAction<string>) {
      const item = state.entities[action.payload];
      if (item && item.cartQty < maxQty(item)) item.cartQty += 1;
    },

    decreaseCart(state, action: PayloadAction<string>) {
      const item = state.entities[action.payload];
      if (!item) return;

      if (item.cartQty <= 1) cartAdapter.removeOne(state, action.payload);
      else item.cartQty -= 1;
    },

    removeFromCart(state, action: PayloadAction<string>) {
      cartAdapter.removeOne(state, action.payload);
    },

    removeAll(state) {
      cartAdapter.removeAll(state);
      state.notices = { priceChanged: [], reduced: [] };
    },

    // The answer of POST /api/cart/validate: current prices and stock
    applyServerSnapshot(state, action: PayloadAction<CartValidationItemDto[]>) {
      for (const snap of action.payload) {
        const item = state.entities[snap.variantId];
        if (!item) continue;

        if (!snap.purchasable) {
          item.availableStock = 0;
          continue;
        }

        const oldUnit = item.salePrice ?? item.price;
        const newUnit = snap.salePrice ?? snap.price;
        if (
          oldUnit !== newUnit &&
          !state.notices.priceChanged.includes(item.variantId)
        ) {
          state.notices.priceChanged.push(item.variantId);
        }

        item.price = snap.price;
        item.salePrice = snap.salePrice;
        item.availableStock = snap.availableStock;

        const limit = maxQty(item);
        if (limit >= 1 && item.cartQty > limit) {
          item.cartQty = limit;
          if (!state.notices.reduced.includes(item.variantId)) {
            state.notices.reduced.push(item.variantId);
          }
        }
      }
    },

    dismissNotices(state) {
      state.notices = { priceChanged: [], reduced: [] };
    },
  },
});

export const {
  addToCart,
  applyServerSnapshot,
  decreaseCart,
  dismissNotices,
  increaseCart,
  populateCart,
  removeAll,
  removeFromCart,
  setCartQty,
} = cartSlice.actions;

/* ----------------------------- selectors ---------------------------- */

export type CartRootState = { cart: ReturnType<typeof cartSlice.reducer> };

const selectors = cartAdapter.getSelectors<CartRootState>(
  (state) => state.cart,
);

export const selectAll = selectors.selectAll;
export const selectCartItems = selectors.selectAll;
export const selectCartHydrated = (state: CartRootState) => state.cart.hydrated;
export const selectCartNotices = (state: CartRootState) => state.cart.notices;

export const selectCartQtyByVariant =
  (variantId: string) => (state: CartRootState) =>
    state.cart.entities[variantId]?.cartQty ?? 0;

// Always derived from the items, so it can never go stale
export const selectCartTotals = createSelector(selectCartItems, (items) => {
  let qty = 0;
  let subtotal = 0; // regular prices, same as Order.subtotal
  let saleDiscount = 0; // savings from sale prices

  for (const { cartQty, price, salePrice } of items) {
    const unit = salePrice != null && salePrice < price ? salePrice : price;
    qty += cartQty;
    subtotal += price * cartQty;
    saleDiscount += (price - unit) * cartQty;
  }

  return { qty, subtotal, saleDiscount, amount: subtotal - saleDiscount };
});

// What the order API reads from the cart. Prices and images come from the database.
export const selectOrderItems = createSelector(selectCartItems, (items) =>
  items.map((item) => ({ variantId: item.variantId, quantity: item.cartQty })),
);

export const selectCartQtyMap = createSelector(
  selectCartItems,
  (items) =>
    Object.fromEntries(
      items.map((item) => [item.variantId, item.cartQty]),
    ) as Record<string, number>,
);
