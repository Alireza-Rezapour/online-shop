"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDashboardStatsQuery } from "@/redux/services/dashboardApi";
import type { DashboardRange } from "@/services/dashboard/dashboard.types";
import { KpiCard, OperationsStrip } from "../../components/dashboard/kpi-card";
import { formatNumber, formatToman } from "../../components/dashboard/format";
import {
  CategoryChart,
  RevenueChart,
  StatusChart,
} from "../../components/dashboard/chart";
import {
  LowStock,
  RecentOrders,
  TopProducts,
} from "../../components/dashboard/lists";
import { PageHeader } from "../../components/AdminShell";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: 7, label: "۷ روز اخیر" },
  { value: 30, label: "۳۰ روز اخیر" },
  { value: 90, label: "۹۰ روز اخیر" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DashboardRange>(30);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDashboardStatsQuery(range, {
      refetchOnMountOrArgChange: true,
    });

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "داشبورد", href: "/admin/dashboard" }]}
      />
      <div className="mx-auto max-w-350 space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">داشبورد</h1>
            <p className="text-sm text-muted-foreground">
              نمای کلی فروش، سفارش‌ها و وضعیت فروشگاه
            </p>
          </div>
          <Tabs
            value={String(range)}
            onValueChange={(v) => setRange(Number(v) as DashboardRange)}
          >
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.value} value={String(r.value)}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm">دریافت اطلاعات داشبورد ناموفق بود.</p>
              <Button variant="outline" onClick={() => refetch()}>
                تلاش دوباره
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <div
            aria-busy={isFetching}
            className={`space-y-6 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="فروش"
                format={formatToman}
                {...data.kpis.revenue}
              />
              <KpiCard
                label="سفارش‌های پرداخت‌شده"
                format={formatNumber}
                {...data.kpis.orders}
              />
              <KpiCard
                label="میانگین ارزش سفارش"
                format={formatToman}
                {...data.kpis.avgOrderValue}
              />
              <KpiCard
                label="مشتری جدید"
                format={formatNumber}
                {...data.kpis.newCustomers}
              />
            </div>

            <OperationsStrip
              items={[
                {
                  label: "در انتظار ارسال",
                  value: formatNumber(data.overview.awaitingShipment),
                  href: "/admin/orders?status=PAID",
                },
                {
                  label: "در انتظار پرداخت",
                  value: formatNumber(data.overview.pendingPayment),
                  href: "/admin/orders?status=PENDING",
                },
                {
                  label: "نرخ پرداخت موفق",
                  value:
                    data.overview.paymentSuccessRate === null
                      ? "—"
                      : `${formatNumber(data.overview.paymentSuccessRate)}٪`,
                },
                {
                  label: "محصولات فعال",
                  value: `${formatNumber(data.overview.publishedProducts)} از ${formatNumber(data.overview.totalProducts)}`,
                  href: "/admin/products",
                },
                {
                  label: "کم‌موجود / ناموجود",
                  value: `${formatNumber(data.overview.lowStockVariants)} / ${formatNumber(data.overview.outOfStockVariants)}`,
                  alert: data.overview.outOfStockVariants > 0,
                },
              ]}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>روند فروش</CardTitle>
                  <CardDescription>
                    فروش روزانه سفارش‌های پرداخت‌شده
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={data.series} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>وضعیت سفارش‌ها</CardTitle>
                  <CardDescription>
                    همه سفارش‌های ثبت‌شده در این بازه
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusChart data={data.ordersByStatus} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>پرفروش‌ترین محصولات</CardTitle>
                  <CardDescription>بر اساس تعداد فروش</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProducts data={data.topProducts} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>فروش به تفکیک دسته‌بندی</CardTitle>
                  <CardDescription>
                    مجموع فروش هر دسته در این بازه
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryChart data={data.categoryRevenue} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>آخرین سفارش‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentOrders data={data.recentOrders} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>هشدار موجودی</CardTitle>
                  <CardDescription>
                    تنوع‌های کم‌موجود یا ناموجود
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LowStock data={data.lowStock} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
