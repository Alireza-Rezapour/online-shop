"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/services/categoryApi";

import {
  buildCategoryTree,
  flattenTree,
  getErrorMessage,
  type CategoryNode,
} from "../../lib/category/category-utils";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { PageHeader } from "../../components/AdminShell";
import { CategoryTree } from "../../components/category/category-tree";
import { CategoryFormDialog } from "../../components/category/category-form-dialog";
import { DeleteCategoryDialog } from "../../components/category/delete-category-dialog";

type FormState = {
  open: boolean;
  category: CategoryNode | null;
  parentId: string | null;
};

export default function AdminCategoryPage() {
  const { data, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>({
    open: false,
    category: null,
    parentId: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);

  const tree = useMemo(
    () =>
      buildCategoryTree(
        (data as Parameters<typeof buildCategoryTree>[0]) ?? [],
      ),
    [data],
  );
  const allNodes = useMemo(() => flattenTree(tree), [tree]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () =>
    setExpanded(
      new Set(allNodes.filter((n) => n.children.length > 0).map((n) => n.id)),
    );
  const collapseAll = () => setExpanded(new Set());

  const openCreate = () =>
    setForm({ open: true, category: null, parentId: null });

  const openAddChild = (parent: CategoryNode) => {
    setExpanded((prev) => new Set(prev).add(parent.id));
    setForm({ open: true, category: null, parentId: parent.id });
  };

  const openEdit = (category: CategoryNode) =>
    setForm({ open: true, category, parentId: null });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id).unwrap();
      SuccessToast("دسته‌بندی حذف شد");
      setDeleteTarget(null);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "حذف دسته‌بندی ناموفق بود"));
    }
  };

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/admin", label: "داشبورد" }]} />

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-muted-foreground">
          ساختار دسته‌بندی‌های فروشگاه را مدیریت کنید.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            باز کردن همه
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            بستن همه
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            دسته‌بندی جدید
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {isLoading && (
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-muted/60" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 p-10 text-sm">
            <p className="text-muted-foreground">
              دریافت دسته‌بندی‌ها ناموفق بود.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              تلاش مجدد
            </Button>
          </div>
        )}

        {!isLoading && !isError && tree.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-10 text-sm">
            <p className="text-muted-foreground">
              هنوز دسته‌بندی‌ای ایجاد نشده است.
            </p>
            <Button size="sm" onClick={openCreate}>
              ایجاد اولین دسته‌بندی
            </Button>
          </div>
        )}

        {!isLoading && !isError && tree.length > 0 && (
          <CategoryTree
            nodes={tree}
            expanded={expanded}
            onToggle={toggle}
            onEdit={openEdit}
            onAddChild={openAddChild}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <CategoryFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        category={form.category}
        defaultParentId={form.parentId}
        allNodes={allNodes}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
