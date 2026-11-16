export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "درانتظار",
  PAID: "پرداخت شده",
  PROCESSING: "درحال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
  RETURNED: "مرجوع شده",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "درانتظار پرداخت",
  SUCCESS: "موفق",
  FAILED: "ناموفق",
  REFUNDED: "بازگشت وجه",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "درانتظار",
  PACKING: "بسته‌بندی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  RETURNED: "مرجوع شده",
};
