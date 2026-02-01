"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useShopifyProducts } from "@/hooks/use-shopify-products";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { ProductsTable } from "@/components/products/products-table";
import { SyncButton } from "@/components/common/sync-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const {
    products,
    pagination,
    isLoading,
    isSyncing,
    error,
    fetchProducts,
    setPage,
    setPageSize,
    syncProducts,
  } = useShopifyProducts(storeId);

  const { collections, fetchCollections } = useShopifyCollections(storeId);

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, [storeId]);

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
            {pagination.total} produit{pagination.total > 1 ? "s" : ""}
          </p>
        </div>
        <SyncButton onSync={handleSync} isSyncing={isSyncing} />
      </div>

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
      {!isLoading && (
        <ProductsTable
          products={products}
          collections={collections}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
