"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShopifyStore, ShopifyStoreFormValues } from "@/types/shopify";
import { apiFetch, ApiError } from "@/lib/api";

export function useStores() {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch<ShopifyStore[]>("/stores");
      console.log(data)
      setStores(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setStores([]);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to load stores");
      }
      console.error("Failed to fetch stores:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const addStore = useCallback(
    async (formValues: ShopifyStoreFormValues): Promise<void> => {
      // 1. Create store in DB with credentials
      const newStore = await apiFetch<ShopifyStore>("/stores", {
        method: "POST",
        body: JSON.stringify(formValues),
      });

      // 2. Start OAuth flow with the new store
      const response = await apiFetch<{ authUrl: string; state: string }>(
        `/shopify/oauth/auth?storeId=${newStore.id}`
      );

      // 3. Redirect to Shopify OAuth
      window.location.href = response.authUrl;
    },
    []
  );

  const updateStore = useCallback(
    async (
      id: string,
      formValues: Partial<ShopifyStoreFormValues>
    ): Promise<ShopifyStore | null> => {
      try {
        const updatedStore = await apiFetch<ShopifyStore>(`/stores/${id}`, {
          method: "PUT",
          body: JSON.stringify(formValues),
        });

        setStores((prev) =>
          prev.map((store) => (store.id === id ? updatedStore : store))
        );

        return updatedStore;
      } catch (err) {
        console.error("Failed to update store:", err);
        return null;
      }
    },
    []
  );

  const deleteStore = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiFetch(`/stores/${id}`, {
        method: "DELETE",
      });

      setStores((prev) => prev.filter((store) => store.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete store:", err);
      return false;
    }
  }, []);

  const getStore = useCallback(
    (id: string): ShopifyStore | undefined => {
      return stores.find((store) => store.id === id);
    },
    [stores]
  );

  const refreshStores = useCallback(() => {
    return fetchStores();
  }, [fetchStores]);

  return {
    stores,
    isLoading,
    error,
    addStore,
    updateStore,
    deleteStore,
    getStore,
    refreshStores,
  };
}
