"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyProduct,
  SyncProductsResponse,
  ProductFilters,
} from "@seo-facile-de-ouf/shared/src/shopify-products";
import type {
  Pagination,
  PaginatedResponse,
} from "@seo-facile-de-ouf/shared/src/api";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyProducts(storeId: string) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (page: number = 1, limit: number = 10, filters?: ProductFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));

        if (filters?.collectionId) {
          params.set("collectionId", filters.collectionId);
        }
        if (filters?.search) {
          params.set("search", filters.search);
        }
        if (filters?.status) {
          params.set("status", filters.status);
        }

        const data = await apiFetch<PaginatedResponse<ShopifyProduct>>(
          `/shops/${storeId}/products?${params.toString()}`,
        );

        setProducts(data.data);
        setPagination(data.pagination);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load products");
        }
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [storeId],
  );

  const setPage = useCallback(
    (page: number) => {
      fetchProducts(page, pagination.limit);
    },
    [fetchProducts, pagination.limit],
  );

  const setPageSize = useCallback(
    (limit: number) => {
      fetchProducts(1, limit);
    },
    [fetchProducts],
  );

  const syncProducts = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch<SyncProductsResponse>(
        `/shops/${storeId}/products/sync`,
        { method: "POST" },
      );

      await fetchProducts(1, pagination.limit);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sync products");
      }
      console.error("Failed to sync products:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [storeId, fetchProducts, pagination.limit]);

  return {
    products,
    pagination,
    isLoading,
    isSyncing,
    error,
    fetchProducts,
    setPage,
    setPageSize,
    syncProducts,
  };
}
