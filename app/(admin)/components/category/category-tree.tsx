"use client";

import {
  ChevronDown,
  ChevronLeft,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryNode } from "../../lib/category/category-utils";

type Props = {
  nodes: CategoryNode[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (node: CategoryNode) => void;
  onAddChild: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
};

export function CategoryTree({ nodes, ...handlers }: Props) {
  return (
    <div>
      {nodes.map((node) => (
        <CategoryRow key={node.id} node={node} {...handlers} />
      ))}
    </div>
  );
}

type RowProps = Omit<Props, "nodes"> & { node: CategoryNode };

function CategoryRow({
  node,
  expanded,
  onToggle,
  onEdit,
  onAddChild,
  onDelete,
}: RowProps) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const productCount = node._count.products;
  const deleteBlockedReason =
    productCount > 0
      ? "این دسته‌بندی محصول دارد"
      : hasChildren
        ? "ابتدا زیردسته‌ها را حذف یا منتقل کنید"
        : null;

  return (
    <div>
      <div
        className="flex items-center gap-3 border-b py-2.5 pe-3 hover:bg-muted/50"
        style={{ paddingInlineStart: `${node.depth * 28 + 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={isOpen ? "بستن زیردسته‌ها" : "نمایش زیردسته‌ها"}
            className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-muted"
          >
            {isOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-6 shrink-0" />
        )}

        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {node.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.imageUrl}
              alt={node.name}
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{node.name}</p>
          <p
            dir="ltr"
            className="truncate text-start text-xs text-muted-foreground"
          >
            {node.slug}
          </p>
        </div>

        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span className="rounded-full bg-muted px-2 py-0.5">
            {productCount} محصول
          </span>
          {hasChildren && (
            <span className="rounded-full bg-muted px-2 py-0.5">
              {node.children.length} زیردسته
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            title="افزودن زیردسته"
            onClick={() => onAddChild(node)}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="ویرایش"
            onClick={() => onEdit(node)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={deleteBlockedReason ?? "حذف"}
            disabled={!!deleteBlockedReason}
            onClick={() => onDelete(node)}
            className="text-secondary hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <CategoryTree
          nodes={node.children}
          expanded={expanded}
          onToggle={onToggle}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
