"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyCollection,
  SyncCollectionsResponse,
} from "@seo-facile-de-ouf/shared/src/shopify";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyCollections(storeId: string) {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch<ShopifyCollection[]>(
        `/shops/${storeId}/collections`
      );
      setCollections(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load collections");
      }
      console.error("Failed to fetch collections:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  const syncCollections = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const response = await apiFetch<SyncCollectionsResponse>(
        `/shops/${storeId}/collections/sync`,
        {
          method: "POST",
        }
      );

      await fetchCollections();
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sync collections");
      }
      console.error("Failed to sync collections:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [storeId, fetchCollections]);

  return {
    collections,
    isLoading,
    isSyncing,
    error,
    fetchCollections,
    syncCollections,
  };
}
