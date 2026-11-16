"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetLookQuery } from "@/redux/services/lookApi";
import { LookForm } from "./look-form";

export function EditLook({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useGetLookQuery(id);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          این ست پیدا نشد یا دریافت آن انجام نشد.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            تلاش دوباره
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/looks">بازگشت به فهرست</Link>
          </Button>
        </div>
      </div>
    );
  }

  // key: a refetch after saving must not reuse stale form state
  return <LookForm key={data.id} mode="edit" look={data} />;
}
