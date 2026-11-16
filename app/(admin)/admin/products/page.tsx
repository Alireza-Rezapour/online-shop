"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useSetProductPublishedMutation,
} from "@/redux/services/productApi";
import type { ProductListItemDto } from "@/services/product/product-list.service";
import {
  buildCategoryTree,
  flattenTree,
} from "../../lib/category/category-utils";
import { getErrorMessage } from "../../lib/product/product-utils";
import { PageHeader } from "../../components/AdminShell";
import { formatPrice } from "@/lib/utils";
import { getPublicUrl } from "@/services/storage/storage.public-url";

type Status = "all" | "published" | "draft";
type Sort = "newest" | "oldest" | "price-asc" | "price-desc" | "title";

const ALL = "all";

const STATUS_LABELS: Record<Status, string> = {
  all: "همه وضعیت‌ها",
  published: "منتشر شده",
  draft: "پیش‌نویس",
};

const SORT_LABELS: Record<Sort, string> = {
  newest: "جدیدترین",
  oldest: "قدیمی‌ترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  title: "الفبایی",
};

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search.trim());

  const { data: categories = [] } = useGetCategoriesQuery();
  const categoryNodes = useMemo(
    () => flattenTree(buildCategoryTree(categories)),
    [categories],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(
    {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      categoryId: categoryId === ALL ? undefined : categoryId,
      status,
      sort,
    },
  );

  const [setPublished] = useSetProductPublishedMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductListItemDto | null>(
    null,
  );

  // Changing any filter goes back to the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, status, sort]);

  // Deleting the last item of the last page would leave an empty page
  useEffect(() => {
    if (data && page > data.pageCount) setPage(data.pageCount);
  }, [data, page]);

  const togglePublished = async (product: ProductListItemDto) => {
    setTogglingId(product.id);
    try {
      await setPublished({
        id: product.id,
        isPublished: !product.isPublished,
      }).unwrap();
      SuccessToast(
        product.isPublished ? "انتشار محصول لغو شد" : "محصول منتشر شد",
      );
    } catch (error) {
      ErrorToast(getErrorMessage(error, "تغییر وضعیت انتشار ناموفق بود"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      SuccessToast("محصول حذف شد");
      setDeleteTarget(null);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "حذف محصول ناموفق بود"));
    }
  };

  const items = data?.items ?? [];
  const hasFilters =
    !!debouncedSearch || categoryId !== ALL || status !== "all";

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/admin", label: "داشبورد" }]} />
      <div className="p-10">
        {/* Toolbar */}
        <div className="mb-6 mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی عنوان، اسلاگ یا SKU"
              className="ps-9"
            />
          </div>

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="همه دسته‌بندی‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>همه دسته‌بندی‌ها</SelectItem>
              {categoryNodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {"— ".repeat(node.depth)}
                  {node.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as Status[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as Sort[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild size="sm" className="ms-auto">
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              محصول جدید
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          {isLoading && (
            <div className="space-y-px">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted/60" />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 p-10 text-sm">
              <p className="text-muted-foreground">
                دریافت محصولات ناموفق بود.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                تلاش مجدد
              </Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-10 text-sm">
              <p className="text-muted-foreground">
                {hasFilters
                  ? "محصولی با این فیلترها پیدا نشد."
                  : "هنوز محصولی ایجاد نشده است."}
              </p>
              {!hasFilters && (
                <Button asChild size="sm">
                  <Link href="/admin/products/new">ایجاد اولین محصول</Link>
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div
              className={
                isFetching
                  ? "overflow-x-auto opacity-60 transition-opacity"
                  : "overflow-x-auto"
              }
            >
              <table className="w-full min-w-200 text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3 text-start font-medium">محصول</th>
                    <th className="p-3 text-start font-medium">دسته‌بندی</th>
                    <th className="p-3 text-start font-medium">قیمت</th>
                    <th className="p-3 text-start font-medium">
                      تنوع / موجودی
                    </th>
                    <th className="p-3 text-start font-medium">وضعیت</th>
                    <th className="p-3 text-start font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const cover = getPublicUrl(product.coverImage);
                    const outOfStock =
                      product.variantCount > 0 && product.availableStock === 0;

                    return (
                      <tr key={product.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                              {cover ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={cover}
                                  alt={product.title}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="size-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-64 truncate font-medium">
                                {product.title}
                              </p>
                              <p
                                dir="ltr"
                                className="max-w-64 truncate text-start text-xs text-muted-foreground"
                              >
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-muted-foreground">
                          {product.category.name}
                        </td>

                        <td className="p-3">
                          {product.salePrice ? (
                            <div>
                              <p className="font-medium">
                                {formatPrice(product.salePrice)}
                              </p>
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.basePrice)}
                              </p>
                            </div>
                          ) : (
                            <p className="font-medium">
                              {formatPrice(product.basePrice)}
                            </p>
                          )}
                        </td>

                        <td className="p-3">
                          {product.variantCount === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              بدون تنوع
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(product.variantCount)} تنوع
                              </p>
                              {outOfStock ? (
                                <span className="inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                                  ناموجود
                                </span>
                              ) : (
                                <p className="font-medium">
                                  {formatPrice(product.availableStock)} عدد
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              product.isPublished
                                ? "rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
                                : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            }
                          >
                            {product.isPublished ? "منتشر شده" : "پیش‌نویس"}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              title="ویرایش"
                            >
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={
                                product.isPublished ? "لغو انتشار" : "انتشار"
                              }
                              disabled={togglingId === product.id}
                              onClick={() => togglePublished(product)}
                            >
                              {product.isPublished ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="حذف"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3 text-sm">
              <p className="text-muted-foreground">
                {formatPrice(data.total)} محصول · صفحه {formatPrice(data.page)}{" "}
                از {formatPrice(data.pageCount)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronRight className="size-4" />
                  قبلی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pageCount || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.title}» مطمئن هستید؟ تنوع‌ها، تصاویر،
              علاقه‌مندی‌ها و نظرات این محصول هم حذف می‌شوند. محصولی که سفارش
              دارد قابل حذف نیست و باید فقط از حالت انتشار خارج شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
