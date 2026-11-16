export type DashboardRange = 7 | 30 | 90;

export interface Kpi {
  value: number;
  previous: number;
}

export interface DashboardStats {
  range: DashboardRange;
  generatedAt: string;
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    avgOrderValue: Kpi;
    newCustomers: Kpi;
  };
  overview: {
    awaitingShipment: number;
    pendingPayment: number;
    paymentSuccessRate: number | null;
    totalCustomers: number;
    totalProducts: number;
    publishedProducts: number;
    lowStockVariants: number;
    outOfStockVariants: number;
  };
  /** One entry per day (Tehran time), date is YYYY-MM-DD */
  series: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: {
    productId: string;
    title: string;
    image: string | null;
    quantity: number;
    revenue: number;
  }[];
  categoryRevenue: { name: string; revenue: number }[];
  lowStock: {
    variantId: string;
    sku: string;
    productTitle: string;
    colorName: string | null;
    sizeName: string | null;
    stock: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
}
