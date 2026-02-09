"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { GenerationHistoryItem } from "@seo-facile-de-ouf/shared/src/generation";

const FIELD_TYPE_LABELS: Record<string, string> = {
  description: "Description",
  seoTitle: "Titre SEO",
  seoDescription: "Description SEO",
  full_description: "Description complète",
  meta_only: "Meta uniquement",
  slug_only: "Slug uniquement",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function getContentPreview(item: GenerationHistoryItem): string {
  if (!item.content) return "—";

  let text = "";
  switch (item.fieldType) {
    case "description":
    case "full_description":
      text = item.content.description || "";
      break;
    case "seoTitle":
      text = item.content.metaTitle || "";
      break;
    case "seoDescription":
      text = item.content.metaDescription || "";
      break;
    default:
      text = item.content.description || item.content.metaTitle || "";
  }

  // Strip HTML tags
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > 100 ? cleaned.slice(0, 100) + "..." : cleaned;
}

export function createHistoryColumns(
  basePath: string
): ColumnDef<GenerationHistoryItem>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm whitespace-nowrap">
            {formatDate(row.original.createdAt)}
          </span>
        );
      },
    },
    {
      accessorKey: "fieldType",
      header: "Type",
      cell: ({ row }) => {
        const label =
          FIELD_TYPE_LABELS[row.original.fieldType] || row.original.fieldType;
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      id: "preview",
      header: "Aperçu",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground line-clamp-2">
            {getContentPreview(row.original)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" asChild>
              <Link href={`${basePath}/history/${row.original._id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
}
