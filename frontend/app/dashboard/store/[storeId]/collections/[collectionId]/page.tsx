"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useShopifyCollection } from "@/hooks/use-shopify-collection";
import { CollectionDetailContent } from "@/components/collections/collection-detail-content";

export default function CollectionDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const collectionId = params.collectionId as string;

  const {
    collection,
    isLoading,
    isSaving,
    isPublishing,
    isSyncing,
    error,
    fetchCollection,
    updateCollection,
    publishCollection,
    syncCollection,
  } = useShopifyCollection(storeId, collectionId);

  useEffect(() => {
    fetchCollection();
  }, [storeId, collectionId]);

  return (
    <CollectionDetailContent
      collection={collection}
      formCollection={collection}
      storeId={storeId}
      collectionId={collectionId}
      isLoading={isLoading}
      isSaving={isSaving}
      isPublishing={isPublishing}
      isSyncing={isSyncing}
      error={error}
      backHref={`/dashboard/store/${storeId}/collections`}
      currentPagePath={`/dashboard/store/${storeId}/collections/${collectionId}`}
      onRetry={fetchCollection}
      onUpdateCollection={updateCollection}
      onPublishCollection={publishCollection}
      onSyncCollection={syncCollection}
    />
  );
}
