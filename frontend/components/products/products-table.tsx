"use client";

import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import type { Pagination } from "@seo-facile-de-ouf/shared/src/api";

interface ProductsTableProps {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  pagination: Pagination;
  storeId: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ProductsTable({
  products,
  collections,
  pagination,
  storeId,
  onPageChange,
  onPageSizeChange,
}: ProductsTableProps) {
  const columns = createColumns(collections, storeId);
  return (
    <DataTable
      columns={columns}
      data={products}
      serverPagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
