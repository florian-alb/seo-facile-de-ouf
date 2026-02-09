"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Calendar, Sparkles } from "lucide-react";

import { useShopifyCollection } from "@/hooks/use-shopify-collection";
import { useGenerationDetail } from "@/hooks/use-generation-history";
import { CollectionDetailContent } from "@/components/collections/collection-detail-content";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";

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

export default function CollectionHistoryDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const collectionId = params.collectionId as string;
  const generationId = params.generationId as string;

  const {
    collection,
    isLoading: collectionLoading,
    isSaving,
    isPublishing,
    isSyncing,
    error: collectionError,
    fetchCollection,
    updateCollection,
    publishCollection,
    syncCollection,
  } = useShopifyCollection(storeId, collectionId);

  const {
    generation,
    isLoading: generationLoading,
    error: generationError,
    fetchGeneration,
  } = useGenerationDetail(generationId);

  useEffect(() => {
    fetchCollection();
    fetchGeneration();
  }, [storeId, collectionId, generationId]);

  const virtualCollection = useMemo<ShopifyCollection | null>(() => {
    if (!collection || !generation?.content) return null;

    return {
      ...collection,
      title: generation.content.title || collection.title,
      descriptionHtml: generation.content.description || collection.descriptionHtml,
      seoTitle: generation.content.metaTitle || collection.seoTitle,
      seoDescription: generation.content.metaDescription || collection.seoDescription,
    };
  }, [collection, generation]);

  const basePath = `/dashboard/store/${storeId}/collections/${collectionId}`;

  const banner = generation ? (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Génération historique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary">
            {FIELD_TYPE_LABELS[generation.fieldType] || generation.fieldType}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(generation.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  ) : null;

  return (
    <CollectionDetailContent
      collection={collection}
      formCollection={virtualCollection}
      storeId={storeId}
      collectionId={collectionId}
      isLoading={collectionLoading || generationLoading}
      isSaving={isSaving}
      isPublishing={isPublishing}
      isSyncing={isSyncing}
      error={collectionError || generationError}
      backHref={`${basePath}/history`}
      currentPagePath={`${basePath}/history/${generationId}`}
      onRetry={() => { fetchCollection(); fetchGeneration(); }}
      onUpdateCollection={updateCollection}
      onPublishCollection={publishCollection}
      onSyncCollection={syncCollection}
      banner={banner}
    />
  );
}
