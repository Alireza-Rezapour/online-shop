/** Pure types and constants: safe to import from client components. */

export const MAX_LOOK_ITEMS = 12;

/* ---------------------------- storefront ---------------------------- */

export type LookProductDto = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  basePrice: number;
  // only set when it is really lower than basePrice
  salePrice: number | null;
  // what the customer pays: salePrice ?? basePrice
  currentPrice: number;
  discountPercent: number | null;
};

export type LookDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  items: LookProductDto[];
  totalPrice: number;
  // sum of basePrice, only when it differs from totalPrice
  totalOriginalPrice: number | null;
};

/* ------------------------------- admin ------------------------------- */

export type AdminLookItemDto = {
  productId: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  basePrice: number;
  salePrice: number | null;
  currentPrice: number;
  isPublished: boolean;
};

export type AdminLookDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  /** Stored storage key (what the upload field edits) */
  image: string;
  imageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  items: AdminLookItemDto[];
  createdAt: string;
};
