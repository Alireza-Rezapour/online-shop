"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardStats } from "@/services/dashboard/dashboard.types";
import {
  formatCompact,
  formatDayKey,
  formatNumber,
  formatToman,
  statusColor,
  statusLabel,
} from "./format";

/* ---------- Revenue over time ---------- */

const revenueConfig = {
  revenue: { label: "فروش", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: DashboardStats["series"] }) {
  return (
    <ChartContainer config={revenueConfig} className="h-72 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {/* reversed + right axis so the chart reads right-to-left */}
        <XAxis
          dataKey="date"
          reversed
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={formatDayKey}
        />
        <YAxis
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={formatCompact}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) =>
                payload?.[0] ? formatDayKey(payload[0].payload.date) : ""
              }
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-1">
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">فروش</span>
                    <span className="font-medium tabular-nums">
                      {formatToman(Number(value))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">تعداد سفارش</span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(item.payload.orders)}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

/* ---------- Orders by status ---------- */

export function StatusChart({
  data,
}: {
  data: DashboardStats["ordersByStatus"];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const config = Object.fromEntries(
    data.map((d) => [
      d.status,
      { label: statusLabel(d.status), color: statusColor(d.status) },
    ]),
  ) satisfies ChartConfig;

  const chartData = data.map((d) => ({
    ...d,
    fill: `var(--color-${d.status})`,
  }));

  if (total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        در این بازه سفارشی ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer
        config={config}
        className="mx-auto aspect-square max-h-48"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel nameKey="status" />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={52}
            strokeWidth={2}
          />
        </PieChart>
      </ChartContainer>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.status} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: statusColor(d.status) }}
              />
              {statusLabel(d.status)}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatNumber(d.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Revenue by category ---------- */

const categoryConfig = {
  revenue: { label: "فروش", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function CategoryChart({
  data,
}: {
  data: DashboardStats["categoryRevenue"];
}) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        هنوز فروشی ثبت نشده است.
      </p>
    );
  }

  return (
    <ChartContainer config={categoryConfig} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide reversed />
        <YAxis
          dataKey="name"
          type="category"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _n, item) => (
                <div className="flex w-full justify-between gap-6">
                  <span className="text-muted-foreground">
                    {item.payload.name}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatToman(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
