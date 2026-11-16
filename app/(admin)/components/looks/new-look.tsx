"use client";

import { useGetAdminLooksQuery } from "@/redux/services/lookApi";
import { LookForm } from "./look-form";

export function NewLook() {
  const { data, isLoading } = useGetAdminLooksQuery();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  // New looks go to the end of the list
  const nextSortOrder = data?.length
    ? Math.max(...data.map((l) => l.sortOrder)) + 1
    : 0;

  return <LookForm mode="create" nextSortOrder={nextSortOrder} />;
}
