"use client";

import { useState, useCallback, useRef } from "react";
import type {
  Pagination,
  PaginatedResponse,
} from "@seo-facile-de-ouf/shared/src/api";
import { apiFetch, ApiError } from "@/lib/api";

interface UseEntityListOptions<F> {
  endpoint: string;
  entityName: string;
  buildParams?: (filters?: F) => Record<string, string>;
}

export function useEntityList<T, F = void>({
  endpoint,
  entityName,
  buildParams,
}: UseEntityListOptions<F>) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef<F | undefined>(undefined);

  const fetchItems = useCallback(
    async (page: number = 1, limit: number = 10, filters?: F) => {
      if (filters !== undefined) {
        filtersRef.current = filters;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));

        const activeFilters = filters !== undefined ? filters : filtersRef.current;
        if (buildParams && activeFilters) {
          const extra = buildParams(activeFilters);
          for (const [key, value] of Object.entries(extra)) {
            if (value) params.set(key, value);
          }
        }

        const data = await apiFetch<PaginatedResponse<T>>(
          `${endpoint}?${params.toString()}`,
        );

        setItems(data.data);
        setPagination(data.pagination);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(`Failed to load ${entityName}`);
        }
        console.error(`Failed to fetch ${entityName}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, entityName, buildParams],
  );

  const setPage = useCallback(
    (page: number) => {
      fetchItems(page, pagination.limit);
    },
    [fetchItems, pagination.limit],
  );

  const setPageSize = useCallback(
    (limit: number) => {
      fetchItems(1, limit);
    },
    [fetchItems],
  );

  const syncItems = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch<unknown>(
        `${endpoint}/sync`,
        { method: "POST" },
      );

      await fetchItems(1, pagination.limit);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`Failed to sync ${entityName}`);
      }
      console.error(`Failed to sync ${entityName}:`, err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [endpoint, entityName, fetchItems, pagination.limit]);

  return {
    items,
    pagination,
    isLoading,
    isSyncing,
    error,
    fetchItems,
    setPage,
    setPageSize,
    syncItems,
  };
}
