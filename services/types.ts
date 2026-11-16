import type { Prisma } from "@/lib/generated/prisma/client";

export interface ShippingAddressInput {
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

// Only what the customer chooses. Prices and the image are read from the database.
export interface OrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  shippingCarrierId: string;
  couponCode?: string;
}

export interface CreateOrderResult {
  orderId: string;
  totalPrice: number;
}

/**
 * A ProductVariant loaded with everything needed to build an OrderItem snapshot.
 */
export type VariantWithRelations = Prisma.ProductVariantGetPayload<{
  include: {
    product: true;
    color: true;
    size: true;
  };
}>;

export interface PricedOrderItem {
  variantId: string;
  sku: string;
  productTitle: string;
  colorName: string;
  sizeName: string;
  // Regular price of one unit
  unitPrice: number;
  // Price of one unit actually charged (equals unitPrice when there is no sale)
  salePrice: number;
  quantity: number;
  // salePrice * quantity
  lineTotal: number;
  image: string;
}

export interface OrderTotals {
  // Regular price of everything: sum of unitPrice * quantity
  subtotal: number;
  // Savings from sale prices: sum of (unitPrice - salePrice) * quantity
  discount: number;
  shippingFee: number;
  // subtotal - discount + shippingFee
  totalPrice: number;
}

export interface CreatePaymentInput {
  orderId: string;
  userId: string;
}

export interface CreatePaymentResult {
  paymentId: string;
  orderId: string;
  amount: number;
}

export interface VerifyPaymentInput {
  paymentId: string;
  success: boolean;
}

export interface VerifyPaymentResult {
  paymentId: string;
  orderId: string;
  status: "SUCCESS" | "FAILED";
}
