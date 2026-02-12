"use client";

import { useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { ProductFilterOptions } from "@seo-facile-de-ouf/shared/src/shopify-products";

export function useProductFilterOptions(storeId: string) {
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({
    productTypes: [],
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ProductFilterOptions>(
        `/shops/${storeId}/products/filter-options`,
      );
      setFilterOptions(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load filter options");
      }
      console.error("Failed to fetch filter options:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  return {
    filterOptions,
    isLoading,
    error,
    fetchFilterOptions,
  };
}
