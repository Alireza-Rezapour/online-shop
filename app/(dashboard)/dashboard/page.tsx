"use client";

import { useGetOrdersQuery } from "@/redux/services/orderApi";
import { Greeting } from "../components/dashboard/greeting";
import { RecentOrdersTable } from "../components/dashboard/recent-orders-table";
import { StatsGrid } from "../components/dashboard/stats-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();

  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery({
    userId: session?.user.id,
  });

  if (ordersLoading) {
    return (
      <div className="grid grid-cols-4">
        {[0, 1, 2, 3].map((n, i) => (
          <Skeleton key={i} className="h-60 mx-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <Greeting />
      {!orders ? (
        <></>
      ) : (
        <>
          <StatsGrid orders={orders} />
          <RecentOrdersTable orders={orders} />
        </>
      )}
    </div>
  );
}
