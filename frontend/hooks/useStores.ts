"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShopifyStore, ShopifyStoreFormValues } from "@/types/shopify";

const STORAGE_KEY = "shopify-stores";

function generateId(): string {
  return `store_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useStores() {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStores(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load stores from localStorage:", error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistStores = useCallback((newStores: ShopifyStore[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStores));
    } catch (error) {
      console.error("Failed to save stores to localStorage:", error);
    }
  }, []);

  const addStore = useCallback(
    (formValues: ShopifyStoreFormValues): ShopifyStore => {
      const now = new Date().toISOString();
      const newStore: ShopifyStore = {
        ...formValues,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };

      setStores((prev) => {
        const updated = [...prev, newStore];
        persistStores(updated);
        return updated;
      });

      return newStore;
    },
    [persistStores]
  );

  const updateStore = useCallback(
    (
      id: string,
      formValues: Partial<ShopifyStoreFormValues>
    ): ShopifyStore | null => {
      let updatedStore: ShopifyStore | null = null;

      setStores((prev) => {
        const index = prev.findIndex((store) => store.id === id);
        if (index === -1) return prev;

        updatedStore = {
          ...prev[index],
          ...formValues,
          updatedAt: new Date().toISOString(),
        };

        const updated = [...prev];
        updated[index] = updatedStore;
        persistStores(updated);
        return updated;
      });

      return updatedStore;
    },
    [persistStores]
  );

  const deleteStore = useCallback(
    (id: string): boolean => {
      let deleted = false;

      setStores((prev) => {
        const filtered = prev.filter((store) => store.id !== id);
        if (filtered.length !== prev.length) {
          deleted = true;
          persistStores(filtered);
        }
        return filtered;
      });

      return deleted;
    },
    [persistStores]
  );

  const getStore = useCallback(
    (id: string): ShopifyStore | undefined => {
      return stores.find((store) => store.id === id);
    },
    [stores]
  );

  return {
    stores,
    isLoading,
    addStore,
    updateStore,
    deleteStore,
    getStore,
  };
}
