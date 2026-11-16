// lib/types.ts
//
// Types mirror the project's Prisma models 1:1. Do not add fields here
// that don't exist on the corresponding Prisma model — if the wizard
// needs a value that isn't persisted, keep it as local component state
// instead of smuggling it into these shapes.

export type ProductStatus = "DRAFT" | "PUBLISHED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  sizeChartId: string;
  parentId: string | null;
  categoryAttributes?: CategoryAttribute[]; // present when API includes it
}

export interface SizeChart {
  id: string;
  name: string;
}

export interface Attribute {
  id: string;
  name: string;
}

export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  attributeId: string;
  category?: Category;
  attribute?: Attribute;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attributeValueId: string;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface Size {
  id: string;
  name: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  type: "COVER" | "HOVER" | "GALLERY";
  sortOrder: number;
}

// This is what the business calls a "variant" — never surfaced in the UI.
export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string | null | unknown;
  sizeId: string | null | unknown;
  price: number;
  salePrice: number | null;
  stock: number;
  reservedStock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  status: ProductStatus;
  basePrice: number | null;
  salePrice: number | null;
  description: string;
}

// ---- Wizard-local draft shape -------------------------------------------
// Everything the wizard collects before it is split across the tables
// above and persisted with Prisma. Kept separate from the Product model
// on purpose: a draft has selections (colorIds, sizeIds, attribute value
// picks) that only become real rows on save.

export interface ProductDraft {
  name: string;
  slug: string;
  categoryId: string | null;
  status: ProductStatus;
  selectedAttributeValues: SelectedAttributeValue[];
  basePrice: string;
  salePrice: string;
  selectedColorIds: string[] | unknown[];
  selectedSizeIds: string[] | unknown[];
  variants: ProductVariant[];
  images: ProductImage[];
  description: string;
  selectedCollectionIds: string[];
}

export const emptyDraft: ProductDraft = {
  name: "",
  slug: "",
  categoryId: null,
  status: "DRAFT",
  selectedAttributeValues: [],
  basePrice: "",
  salePrice: "",
  selectedColorIds: [],
  selectedSizeIds: [],
  variants: [],
  images: [],
  description: "",
  selectedCollectionIds: [],
};

export interface AttributeValue {
  id: string;
  value: string;
  attributeId: string;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  attributeId: string;
  category?: Category;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
  categories: CategoryAttribute[];
}

export interface SelectedAttributeValue {
  attributeId: string;
  attributeValueId: string;
}

export type OrderStatus = "Delivered" | "Processing" | "Cancelled";

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  color?: string;
  size?: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  itemsCount: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  colors?: string[];
  rating?: number;
  category?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "order" | "promo" | "system";
}

export interface Coupon {
  id: string;
  code: string;
  discount: string;
  expiresAt: string;
  used: boolean;
}

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  message: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  avatar: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  description: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}
