"use client";

import { useState, useCallback } from "react";
import type {
  ShopifyProduct,
  ProductUpdateInput,
  ProductUpdateResponse,
  ProductPublishResponse,
} from "@seo-facile-de-ouf/shared/src/shopify-products";
import { apiFetch, ApiError } from "@/lib/api";

export function useShopifyProduct(storeId: string, productId: string) {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ShopifyProduct>(
        `/shops/${storeId}/products/${productId}`
      );
      setProduct(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load product");
      }
      console.error("Failed to fetch product:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, productId]);

  const updateProduct = useCallback(
    async (data: ProductUpdateInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await apiFetch<ProductUpdateResponse>(
          `/shops/${storeId}/products/${productId}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
        );

        setProduct(response.product);
        return response;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to update product");
        }
        console.error("Failed to update product:", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [storeId, productId]
  );

  const publishProduct = useCallback(
    async (data: ProductUpdateInput) => {
      setIsPublishing(true);
      setError(null);

      try {
        const response = await apiFetch<ProductPublishResponse>(
          `/shops/${storeId}/products/${productId}/publish`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        setProduct(response.product);
        return response;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to publish product");
        }
        console.error("Failed to publish product:", err);
        throw err;
      } finally {
        setIsPublishing(false);
      }
    },
    [storeId, productId]
  );

  const syncProduct = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch<ProductUpdateResponse>(
        `/shops/${storeId}/products/${productId}/sync`,
        { method: "POST" }
      );

      setProduct(response.product);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sync product");
      }
      console.error("Failed to sync product:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [storeId, productId]);

  return {
    product,
    isLoading,
    isSaving,
    isPublishing,
    isSyncing,
    error,
    fetchProduct,
    updateProduct,
    publishProduct,
    syncProduct,
  };
}
