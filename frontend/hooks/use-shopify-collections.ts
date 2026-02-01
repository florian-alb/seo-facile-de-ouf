"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyCollection,
  SyncCollectionsResponse,
} from "@seo-facile-de-ouf/shared/src/shopify-collections";
import type {
  Pagination,
  PaginatedResponse,
} from "@seo-facile-de-ouf/shared/src/api";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyCollections(storeId: string) {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));

        const data = await apiFetch<PaginatedResponse<ShopifyCollection>>(
          `/shops/${storeId}/collections?${params.toString()}`,
        );

        setCollections(data.data);
        setPagination(data.pagination);
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
    },
    [storeId],
  );

  const setPage = useCallback(
    (page: number) => {
      fetchCollections(page, pagination.limit);
    },
    [fetchCollections, pagination.limit],
  );

  const setPageSize = useCallback(
    (limit: number) => {
      fetchCollections(1, limit);
    },
    [fetchCollections],
  );

  const syncCollections = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const response = await apiFetch<SyncCollectionsResponse>(
        `/shops/${storeId}/collections/sync`,
        {
          method: "POST",
        },
      );

      await fetchCollections(1, pagination.limit);
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
  }, [storeId, fetchCollections, pagination.limit]);

  return {
    collections,
    pagination,
    isLoading,
    isSyncing,
    error,
    fetchCollections,
    setPage,
    setPageSize,
    syncCollections,
  };
}
