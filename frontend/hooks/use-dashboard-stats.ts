"use client";

import { useState, useEffect } from "react";
import { useStores } from "@/hooks/use-shopify-stores";
import { apiFetch } from "@/lib/api";
import type { ShopifyStore } from "@/types/shopify";

interface Generation {
  _id: string;
  productId: string;
  productName: string;
  fieldType: string;
  status: "pending" | "processing" | "completed" | "failed";
  shopId: string;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalStores: number;
  connectedStores: number;
  totalProducts: number;
  totalCollections: number;
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  recentGenerations: Generation[];
  stores: ShopifyStore[];
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { stores, isLoading: storesLoading } = useStores();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCollections, setTotalCollections] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch generations
  useEffect(() => {
    async function fetchGenerations() {
      try {
        const data = await apiFetch<Generation[]>("/generations/");
        setGenerations(data);
      } catch {
        // Silently fail — stats are best-effort
      }
    }
    fetchGenerations();
  }, []);

  // Fetch product/collection totals for each connected store
  useEffect(() => {
    if (storesLoading) return;

    const connectedStores = stores.filter((s) => s.status === "connected");
    if (connectedStores.length === 0) {
      setIsLoadingStats(false);
      return;
    }

    async function fetchTotals() {
      let products = 0;
      let collections = 0;

      await Promise.all(
        connectedStores.map(async (store) => {
          try {
            const [prodRes, collRes] = await Promise.all([
              apiFetch<{ data: unknown[]; pagination: { total: number } }>(
                `/shops/${store.id}/products?limit=1`
              ),
              apiFetch<{ data: unknown[]; pagination: { total: number } }>(
                `/shops/${store.id}/collections?limit=1`
              ),
            ]);
            products += prodRes.pagination.total;
            collections += collRes.pagination.total;
          } catch {
            // Skip stores that fail
          }
        })
      );

      setTotalProducts(products);
      setTotalCollections(collections);
      setIsLoadingStats(false);
    }

    fetchTotals();
  }, [stores, storesLoading]);

  const connectedStores = stores.filter((s) => s.status === "connected").length;
  const completedGenerations = generations.filter(
    (g) => g.status === "completed"
  ).length;
  const failedGenerations = generations.filter(
    (g) => g.status === "failed"
  ).length;

  const recentGenerations = [...generations]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return {
    totalStores: stores.length,
    connectedStores,
    totalProducts,
    totalCollections,
    totalGenerations: generations.length,
    completedGenerations,
    failedGenerations,
    recentGenerations,
    stores,
    isLoading: storesLoading || isLoadingStats,
  };
}
