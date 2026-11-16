export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  colorName?: string;
  sizeName?: string;
  quantity: number;
  salePrice: number;
  unitPrice: number;
  lineTotal: number;
  orderId: string;
  productTitle: string;
  sku: string;
  variantId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
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
