"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, Sparkles } from "lucide-react";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify";

export const columns: ColumnDef<ShopifyCollection>[] = [
  {
    accessorKey: "title",
    header: "Collection",
    cell: ({ row }) => {
      const collection = row.original;
      return (
        <div className="flex items-center gap-3">
          {collection.imageUrl ? (
            <div className="h-10 w-10 flex items-center justify-center rounded overflow-hidden bg-muted">
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt || collection.title}
                width={50}
                height={50}
                className="h-10 w-10 object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded bg-muted text-muted-foreground text-xs font-medium select-none">
              <span>
                {collection.title
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <div className="font-medium">{collection.title}</div>
            <div className="text-sm text-muted-foreground">
              {collection.handle}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "productsCount",
    header: () => <div className="text-center">Nombre de produits</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("productsCount")}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action rapide</div>,
    cell: () => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Générer
          </Button>
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
