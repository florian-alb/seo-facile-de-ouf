"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useShopifyCollection } from "@/hooks/use-shopify-collection";
import { useGenerationHistory } from "@/hooks/use-generation-history";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { GenerationHistoryList } from "@/components/history/generation-history-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CollectionHistoryPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const collectionId = params.collectionId as string;

  const { collection, isLoading: collectionLoading, fetchCollection } = useShopifyCollection(storeId, collectionId);
  const { generations, isLoading: historyLoading, error, fetchGenerations } = useGenerationHistory("collection", collectionId);

  useEffect(() => {
    fetchCollection();
    fetchGenerations();
  }, [storeId, collectionId]);

  const basePath = `/dashboard/store/${storeId}/collections/${collectionId}`;
  const isLoading = collectionLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/store/${storeId}/collections`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold line-clamp-1">
            {collection?.title || "Collection"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {collection?.handle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <EntityTabs basePath={basePath} />

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : generations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune génération pour cette collection.
        </div>
      ) : (
        <GenerationHistoryList generations={generations} basePath={basePath} />
      )}
    </div>
  );
}
