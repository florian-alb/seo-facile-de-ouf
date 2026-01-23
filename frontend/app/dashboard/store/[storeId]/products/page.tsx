"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useShopifyProducts } from "@/hooks/use-shopify-products";
import { ProductsFilters } from "@/components/products/products-filters";
import { ProductsTable } from "@/components/products/products-table";
import { SyncButton } from "@/components/collections/sync-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const {
    products,
    filters,
    isLoading,
    isSyncing,
    error,
    fetchProducts,
    syncProducts,
    updateFilters,
    clearFilters,
  } = useShopifyProducts(storeId);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Refetch when filters change (with debounce handled in the component)
  useEffect(() => {
    if (filters.collectionId !== undefined || filters.status !== undefined) {
      fetchProducts(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.collectionId, filters.status, storeId]);

  const handleSync = async () => {
    try {
      const response = await syncProducts();
      toast.success(response.message || "Produits synchronisés avec succès");
    } catch (err) {
      toast.error("Erreur lors de la synchronisation des produits");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
        <SyncButton onSync={handleSync} isSyncing={isSyncing} />
      </div>

      {/* Filters */}
      <ProductsFilters
        storeId={storeId}
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        onSearch={(search) => fetchProducts({ ...filters, search })}
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {/* Products Table */}
      {!isLoading && <ProductsTable products={products} storeId={storeId} />}
    </div>
  );
}
