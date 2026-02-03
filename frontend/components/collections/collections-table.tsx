"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import type { Pagination } from "@seo-facile-de-ouf/shared/src/api";

interface CollectionsTableProps {
  storeId: string;
  collections: ShopifyCollection[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function CollectionsTable({
  storeId,
  collections,
  pagination,
  onPageChange,
  onPageSizeChange,
}: CollectionsTableProps) {
  const columns = useMemo(() => createColumns(storeId), [storeId]);

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
