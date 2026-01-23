"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify";

interface CollectionsTableProps {
  collections: ShopifyCollection[];
}

export function CollectionsTable({ collections }: CollectionsTableProps) {
  return <DataTable columns={columns} data={collections} />;
}
