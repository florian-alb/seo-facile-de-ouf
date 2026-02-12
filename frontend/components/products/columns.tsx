"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";

export function createColumns(
  collections: ShopifyCollection[],
  storeId: string,
  selectable: boolean = false
): ColumnDef<ShopifyProduct>[] {
  const collectionMap = new Map(
    collections.map((c) => [c.shopifyGid, c.title])
  );

  const selectColumn: ColumnDef<ShopifyProduct> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const dataColumns: ColumnDef<ShopifyProduct>[] = [
    {
      accessorKey: "title",
      header: "Produit",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            {product.imageUrl ? (
              <div className="h-10 w-10 flex items-center justify-center rounded overflow-hidden bg-muted">
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.title}
                  width={50}
                  height={50}
                  className="h-10 w-10 object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 flex items-center justify-center rounded bg-muted text-muted-foreground text-xs font-medium select-none">
                <span>
                  {product.title
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  }
                </span>
              </div>
            )}

            <div>
              <div className="font-medium">{product.title}</div>
              <div className="text-sm text-muted-foreground">
                {product.handle}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "collectionIds",
      header: "Collections",
      cell: ({ row }) => {
        const product = row.original;
        const productCollections = product.collectionIds
          .map((gid) => collectionMap.get(gid))
          .filter((title): title is string => title !== undefined);

        if (productCollections.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">Aucune</span>
          );
        }

        return (
          <div className="flex flex-wrap gap-1">
            {productCollections.map((title, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {title}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Action rapide</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Générer
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/dashboard/store/${storeId}/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return selectable ? [selectColumn, ...dataColumns] : dataColumns;
}
