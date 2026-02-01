"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import type { Pagination } from "@seo-facile-de-ouf/shared/src/api";

interface CollectionsTableProps {
  collections: ShopifyCollection[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function CollectionsTable({
  collections,
  pagination,
  onPageChange,
  onPageSizeChange,
}: CollectionsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={collections}
      serverPagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
