export type CheckoutStep = "cart" | "address" | "payment";

export type AddressLabel = "خانه" | "محل کار" | "سایر";

export interface Address {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  details: string;
  postalCode: string;
  label?: AddressLabel;
  isDefault?: boolean;
}

export interface AddressFormValues {
  id?: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  details: string;
  postalCode: string;
  label?: string;
  isDefault: boolean;
  userId: string | undefined;
}

export interface OrderSummaryData {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export type OrderDraft = {
  items: OrderItemDraft[];

  shippingReceiverName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingCarrierId: string;
  couponCode: string;
};

export const emptyOrderDraft: OrderDraft = {
  items: [],

  shippingReceiverName: "",
  shippingPhone: "",
  shippingProvince: "",
  shippingCity: "",
  shippingAddress: "",
  shippingPostalCode: "",
  shippingCarrierId: "",
  couponCode: "",
};

/**
 * Shared types for Step 3 (Payment).
 *
 * Adjust these to match your actual Redux slice / API contract shapes —
 * these are written to document what Step3Payment expects to receive.
 */

export interface CheckoutCostSummary {
  /** Sum of line-item prices before shipping/discount */
  subtotal?: number;
  shippingFee?: number;
  /** Positive number representing the amount deducted, e.g. 50000 = 50,000 off */
  discount?: number;
  /** Final payable amount: subtotal + shippingFee - discount */
  total?: number;
}

export type PaymentMethodId = "online";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
}

/**
 * Expected shape of the response from `useCreateOrderMutation()`.
 * TODO: align this with the real API response type once confirmed.
 */
export interface CreateOrderResponse {
  orderId: string;
}

// replaces CartProduct
export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  variantId: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  sizeId: string;
  sizeName: string;
  // Regular price of one unit, and the sale price (null when there is no sale)
  price: number;
  salePrice: number | null;
  availableStock: number;
  cartQty: number;
};

// replaces OrderTotals (no tax)
export interface OrderTotals {
  subtotal: number; // regular prices
  discount: number; // sale savings
  couponDiscount: number;
  total: number; // items only, shipping is added in the address step
}

// replaces OrderItemDraft: the image is read from the database now
export type OrderItemDraft = {
  variantId: string;
  quantity: number;
};

// OrderDraft gets one new field at the bottom, and emptyOrderDraft its default:
//   couponCode: string;
// export const emptyOrderDraft: OrderDraft = { ..., couponCode: "" };
