"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRow } from "./product-row";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify";

interface ProductsTableProps {
  products: ShopifyProduct[];
  storeId: string;
}

export function ProductsTable({ products, storeId }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun produit trouvé. Synchronisez vos produits pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with count - matching design reference */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {products.length} produit{products.length > 1 ? "s" : ""}
        </span>
        <div className="flex gap-8">
          <span>Statut</span>
          <span>Action rapide</span>
          <span>Aperçu</span>
        </div>
      </div>

      {/* Table - clean design like in mockup */}
      <Table>
        <TableHeader className="hidden">
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="w-[120px]">Prix</TableHead>
            <TableHead className="w-[100px]">Inventaire</TableHead>
            <TableHead className="w-[100px]">Statut</TableHead>
            <TableHead className="w-[200px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} storeId={storeId} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
