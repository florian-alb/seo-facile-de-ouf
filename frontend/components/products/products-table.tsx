"use client";

import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import type {
  ShopifyProduct,
  ShopifyCollection,
} from "@seo-facile-de-ouf/shared/src/shopify";

interface ProductsTableProps {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
}

export function ProductsTable({
  products,
  collections,
}: ProductsTableProps) {
  const columns = createColumns(collections);
  return <DataTable columns={columns} data={products} />;
}
