"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from 'next/image'
import { Eye, Sparkles } from "lucide-react";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify";

interface CollectionRowProps {
  collection: ShopifyCollection;
}

export function CollectionRow({ collection }: CollectionRowProps) {
  return (
    <TableRow>
      <TableCell>
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
                  .map(word => word[0])
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
      </TableCell>
      <TableCell className="text-center">{collection.productsCount}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Générer
          </Button>
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
