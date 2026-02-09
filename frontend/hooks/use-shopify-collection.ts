"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyCollection,
  CollectionUpdateInput,
  CollectionUpdateResponse,
  CollectionPublishResponse,
} from "@seo-facile-de-ouf/shared/src/shopify-collections";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyCollection(storeId: string, collectionId: string) {
  const [collection, setCollection] = useState<ShopifyCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ShopifyCollection>(
        `/shops/${storeId}/collections/${collectionId}`
      );
      setCollection(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load collection");
      }
      console.error("Failed to fetch collection:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, collectionId]);

  const updateCollection = useCallback(
    async (data: CollectionUpdateInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await apiFetch<CollectionUpdateResponse>(
          `/shops/${storeId}/collections/${collectionId}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
        );

        setCollection(response.collection);
        return response;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to update collection");
        }
        console.error("Failed to update collection:", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [storeId, collectionId]
  );

  const publishCollection = useCallback(
    async (data: CollectionUpdateInput) => {
      setIsPublishing(true);
      setError(null);

      try {
        const response = await apiFetch<CollectionPublishResponse>(
          `/shops/${storeId}/collections/${collectionId}/publish`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        setCollection(response.collection);
        return response;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to publish collection");
        }
        console.error("Failed to publish collection:", err);
        throw err;
      } finally {
        setIsPublishing(false);
      }
    },
    [storeId, collectionId]
  );

  const syncCollection = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch<CollectionUpdateResponse>(
        `/shops/${storeId}/collections/${collectionId}/sync`,
        { method: "POST" }
      );

      setCollection(response.collection);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sync collection");
      }
      console.error("Failed to sync collection:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [storeId, collectionId]);

  return {
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
  };
}
