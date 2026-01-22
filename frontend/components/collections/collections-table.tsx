"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollectionRow } from "./collection-row";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify";

interface CollectionsTableProps {
  collections: ShopifyCollection[];
}

export function CollectionsTable({ collections }: CollectionsTableProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          Aucune collection synchronisée
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Cliquez sur "Synchroniser les collections" pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Collection</TableHead>
            <TableHead className="text-center">Nombre de produits</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action rapide</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
