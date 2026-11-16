import { OrderStatus } from "@/lib/generated/prisma/enums";
import { DashboardRange, DashboardStats } from "./dashboard.types";
import prisma from "@/lib/prisma";
import { getPublicUrl } from "../storage/storage.public-url";

const DAY_MS = 86_400_000;
const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000; // Iran has no DST since 2022
const LOW_STOCK_THRESHOLD = 5;

/** Orders that count as real sales. Adjust to match your OrderStatus enum. */
const REVENUE_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/** YYYY-MM-DD of the given instant in Tehran time */
function dayKey(date: Date): string {
  return new Date(date.getTime() + TEHRAN_OFFSET_MS).toISOString().slice(0, 10);
}

export async function getDashboardStats(
  days: DashboardRange,
): Promise<DashboardStats> {
  const now = new Date();

  // Window boundaries aligned to Tehran midnight
  const todayStart = Date.parse(`${dayKey(now)}T00:00:00Z`) - TEHRAN_OFFSET_MS;
  const start = new Date(todayStart - (days - 1) * DAY_MS);
  const prevStart = new Date(start.getTime() - days * DAY_MS);

  // role is nullable, so a plain `not: "admin"` would drop NULL rows
  const customerFilter = { OR: [{ role: null }, { role: { not: "admin" } }] };

  const [
    orders,
    newCustomers,
    prevNewCustomers,
    statusGroups,
    items,
    paymentGroups,
    awaitingShipment,
    pendingPayment,
    totalCustomers,
    totalProducts,
    publishedProducts,
    lowStockVariants,
    outOfStockVariants,
    lowStockRows,
    recentRows,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: prevStart } },
      select: { createdAt: true, totalPrice: true, status: true },
    }),
    prisma.user.count({
      where: { ...customerFilter, createdAt: { gte: start } },
    }),
    prisma.user.count({
      where: { ...customerFilter, createdAt: { gte: prevStart, lt: start } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: {
        order: { status: { in: REVENUE_STATUSES }, createdAt: { gte: start } },
      },
      select: {
        productTitle: true,
        image: true,
        quantity: true,
        lineTotal: true,
        variant: {
          select: {
            productId: true,
            product: { select: { category: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: customerFilter }),
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.productVariant.count({
      where: {
        stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
        product: { isPublished: true },
      },
    }),
    prisma.productVariant.count({
      where: { stock: { lte: 0 }, product: { isPublished: true } },
    }),
    prisma.productVariant.findMany({
      where: {
        stock: { lte: LOW_STOCK_THRESHOLD },
        product: { isPublished: true },
      },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        sku: true,
        stock: true,
        product: { select: { title: true } },
        color: { select: { name: true } },
        size: { select: { name: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        shippingReceiverName: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  // ---- Daily series + KPI totals (current vs previous period) ----
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    buckets.set(dayKey(new Date(start.getTime() + i * DAY_MS)), {
      revenue: 0,
      orders: 0,
    });
  }

  let revenue = 0;
  let orderCount = 0;
  let prevRevenue = 0;
  let prevOrderCount = 0;

  for (const order of orders) {
    if (!REVENUE_STATUSES.includes(order.status)) continue;
    if (order.createdAt >= start) {
      revenue += order.totalPrice;
      orderCount += 1;
      const bucket = buckets.get(dayKey(order.createdAt));
      if (bucket) {
        bucket.revenue += order.totalPrice;
        bucket.orders += 1;
      }
    } else {
      prevRevenue += order.totalPrice;
      prevOrderCount += 1;
    }
  }

  // ---- Top products + revenue by category (from the same items query) ----
  const productMap = new Map<
    string,
    { title: string; image: string | null; quantity: number; revenue: number }
  >();
  const categoryMap = new Map<string, number>();

  for (const item of items) {
    const productKey = item.variant?.productId ?? item.productTitle;
    const entry = productMap.get(productKey) ?? {
      title: item.productTitle,
      image: getPublicUrl(item.image) ?? null,
      quantity: 0,
      revenue: 0,
    };
    entry.quantity += item.quantity;
    entry.revenue += item.lineTotal;
    productMap.set(productKey, entry);

    const categoryName =
      item.variant?.product?.category?.name ?? "بدون دسته‌بندی";
    categoryMap.set(
      categoryName,
      (categoryMap.get(categoryName) ?? 0) + item.lineTotal,
    );
  }

  const topProducts = [...productMap.entries()]
    .map(([productId, p]) => ({ productId, ...p }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const categoryRevenue = [...categoryMap.entries()]
    .map(([name, value]) => ({ name, revenue: value }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // ---- Payment success rate ----
  const paymentCount = (status: string) =>
    paymentGroups.find((g) => g.status === status)?._count._all ?? 0;
  const paymentSuccess = paymentCount("SUCCESS");
  const paymentFinished =
    paymentSuccess + paymentCount("FAILED") + paymentCount("EXPIRED");

  return {
    range: days,
    generatedAt: now.toISOString(),
    kpis: {
      revenue: { value: revenue, previous: prevRevenue },
      orders: { value: orderCount, previous: prevOrderCount },
      avgOrderValue: {
        value: orderCount ? Math.round(revenue / orderCount) : 0,
        previous: prevOrderCount ? Math.round(prevRevenue / prevOrderCount) : 0,
      },
      newCustomers: { value: newCustomers, previous: prevNewCustomers },
    },
    overview: {
      awaitingShipment,
      pendingPayment,
      paymentSuccessRate: paymentFinished
        ? (paymentSuccess / paymentFinished) * 100
        : null,
      totalCustomers,
      totalProducts,
      publishedProducts,
      lowStockVariants,
      outOfStockVariants,
    },
    series: [...buckets.entries()].map(([date, v]) => ({ date, ...v })),
    ordersByStatus: statusGroups
      .map((g) => ({ status: g.status, count: g._count._all }))
      .sort((a, b) => b.count - a.count),
    topProducts,
    categoryRevenue,
    lowStock: lowStockRows.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      productTitle: v.product.title,
      colorName: v.color?.name ?? null,
      sizeName: v.size?.name ?? null,
      stock: v.stock,
    })),
    recentOrders: recentRows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.shippingReceiverName || o.user?.name || "—",
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
