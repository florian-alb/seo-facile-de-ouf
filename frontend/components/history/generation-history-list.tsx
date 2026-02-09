"use client";

import { DataTable } from "@/components/ui/data-table";
import { createHistoryColumns } from "./history-columns";
import type { GenerationHistoryItem } from "@seo-facile-de-ouf/shared/src/generation";

interface GenerationHistoryListProps {
  generations: GenerationHistoryItem[];
  basePath: string;
}

export function GenerationHistoryList({
  generations,
  basePath,
}: GenerationHistoryListProps) {
  const columns = createHistoryColumns(basePath);

  return <DataTable columns={columns} data={generations} />;
}
