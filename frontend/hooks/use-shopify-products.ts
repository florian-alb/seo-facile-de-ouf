"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyProduct,
  SyncProductsResponse,
  ProductFilters,
} from "@seo-facile-de-ouf/shared/src/shopify";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyProducts(storeId: string) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  //const [filters, setFilters] = useState<ProductFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (newFilters?: ProductFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        //const activeFilters = newFilters ?? filters;

        // Build query string
        const params = new URLSearchParams();
        // if (activeFilters.collectionId)
        //   params.set("collectionId", activeFilters.collectionId);
        // if (activeFilters.search) params.set("search", activeFilters.search);
        // if (activeFilters.status) params.set("status", activeFilters.status);

        const queryString = params.toString();
        const url = `/shops/${storeId}/products${queryString ? `?${queryString}` : ""}`;

        const data = await apiFetch<ShopifyProduct[]>(url);
        setProducts(data);
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
    [storeId]
  );

  const syncProducts = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch<SyncProductsResponse>(
        `/shops/${storeId}/products/sync`,
        { method: "POST" }
      );

      // Refetch products after sync
      await fetchProducts();

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
  }, [storeId, fetchProducts]);

  // const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
  //   setFilters((prev) => ({ ...prev, ...newFilters }));
  // }, []);

  // const clearFilters = useCallback(() => {
  //   setFilters({});
  // }, []);

  return {
    products,
    //filters,
    isLoading,
    isSyncing,
    error,
    fetchProducts,
    syncProducts,
    // updateFilters,
    // clearFilters,
  };
}
