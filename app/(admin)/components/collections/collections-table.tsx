"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Layers, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { CollectionStatusBadge } from "./collection-status-badge";
import { CollectionFormDialog } from "./collection-form-dialog";
import { DeleteCollectionDialog } from "./delete-collection-dialog";
import {
  useDeleteCollectionMutation,
  useGetAdminCollectionsQuery,
} from "@/redux/services/collectionApi";

import { Collection } from "../../lib/types";
import { AdminCollectionDto } from "@/services/collection/collection.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { EmptyState } from "@/app/(dashboard)/components/shared/state-views";
import { CollectionProductsDialog } from "./collection-products-dialog";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fa-IR");
}

export function CollectionsTable() {
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCollectionDto | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminCollectionDto | null>(null);

  const [productsFor, setProductsFor] = useState<AdminCollectionDto | null>(
    null,
  );

  const { data: collections = [], isLoading } = useGetAdminCollectionsQuery();
  const [deleteCollection] = useDeleteCollectionMutation();

  const filtered = useMemo(
    () =>
      collections.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [collections, query],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (collection: AdminCollectionDto) => {
    setEditing(collection);
    setFormOpen(true);
  };

  const openDelete = (collection: AdminCollectionDto) => {
    setDeleting(collection);
    setDeleteOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCollection(id).unwrap();
      SuccessToast("مجموعه حذف شد");
    } catch {
      ErrorToast("حذف مجموعه با خطا مواجه شد.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام مجموعه را جستجو کنید ..."
            className="pl-10"
          />
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> افزودن مجموعه
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="هیچ مجموعه‌ای یافت نشد"
          description="جستجو را تغییر دهید یا مجموعه جدید اضافه کنید"
          actionLabel="افزودن مجموعه"
          onAction={openNew}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">مجموعه</TableHead>
                    <TableHead>اسلاگ</TableHead>
                    <TableHead>تعداد محصولات</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>ویرایش شده در</TableHead>
                    <TableHead className="pr-5">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                            {collection.imageUrl ? (
                              <Image
                                src={collection.imageUrl}
                                alt={collection.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-foreground">
                            {collection.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {collection.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {collection.productCount}
                      </TableCell>
                      <TableCell>
                        <CollectionStatusBadge collection={collection} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(collection.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(collection)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-danger hover:bg-danger-bg hover:text-danger"
                            onClick={() => openDelete(collection)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((collection) => (
                <div
                  key={collection.id}
                  className="rounded-xl border border-border_soft p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                      {collection.imageUrl ? (
                        <Image
                          src={collection.imageUrl}
                          alt={collection.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collection.slug} · {collection.productCount} محصول
                      </p>
                      <div className="mt-1.5">
                        <CollectionStatusBadge collection={collection} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-border_soft pt-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="محصولات"
                      onClick={() => setProductsFor(collection)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(collection)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> ویرایش
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger hover:bg-danger-bg"
                      onClick={() => openDelete(collection)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CollectionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        collection={editing}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={deleting}
        onConfirm={handleDelete}
      />
      <CollectionProductsDialog
        open={!!productsFor}
        onOpenChange={(open) => !open && setProductsFor(null)}
        collection={productsFor}
      />
    </div>
  );
}
