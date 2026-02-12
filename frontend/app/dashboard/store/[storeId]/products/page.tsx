"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useShopifyProducts } from "@/hooks/use-shopify-products";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { useProductFilterOptions } from "@/hooks/use-product-filter-options";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { useBulkGeneration, type BulkGenerationType } from "@/hooks/use-bulk-generation";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsFilters } from "@/components/products/products-filters";
import { BulkActionBar } from "@/components/products/bulk-action-bar";
import { SyncButton } from "@/components/common/sync-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ProductFilters,
  ShopifyProduct,
} from "@seo-facile-de-ouf/shared/src/shopify-products";

export default function ProductsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedProductsMap, setSelectedProductsMap] = useState<
    Map<string, ShopifyProduct>
  >(new Map());

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
  const { filterOptions, fetchFilterOptions } =
    useProductFilterOptions(storeId);
  const { settings, fetchSettings } = useStoreSettings(storeId);
  const {
    generateBulk,
    jobStatesArray,
    generationType,
    isGenerating,
    totalCount,
    completedCount,
    failedCount,
    doneCount,
    hasActiveJobs,
    reset: resetBulk,
  } = useBulkGeneration();

  useEffect(() => {
    fetchProducts(1, 10, filters);
    fetchCollections();
    fetchFilterOptions();
    fetchSettings();
  }, [storeId]);

  const handleClearSelection = useCallback(() => {
    setSelectedProductIds(new Set());
    setSelectedProductsMap(new Map());
  }, []);

  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedProductIds(newSelectedIds);

      setSelectedProductsMap((prev) => {
        const next = new Map(prev);

        // Add newly selected products from current page data
        for (const id of newSelectedIds) {
          if (!next.has(id)) {
            const product = products.find((p) => p.id === id);
            if (product) next.set(id, product);
          }
        }

        // Remove deselected products
        for (const id of prev.keys()) {
          if (!newSelectedIds.has(id)) {
            next.delete(id);
          }
        }

        return next;
      });
    },
    [products]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      fetchProducts(1, pagination.limit, updated);
      handleClearSelection();
    },
    [filters, fetchProducts, pagination.limit, handleClearSelection]
  );

  const handleSearch = useCallback(
    (search: string) => {
      const updated = { ...filters, search: search || undefined };
      setFilters(updated);
      fetchProducts(1, pagination.limit, updated);
      handleClearSelection();
    },
    [filters, fetchProducts, pagination.limit, handleClearSelection]
  );

  const handleClearFilters = useCallback(() => {
    const cleared: ProductFilters = {};
    setFilters(cleared);
    fetchProducts(1, pagination.limit, cleared);
    handleClearSelection();
  }, [fetchProducts, pagination.limit, handleClearSelection]);

  const handleSync = async () => {
    try {
      const response = await syncProducts() as { message?: string };
      toast.success(response.message || "Produits synchronises avec succes");
      fetchFilterOptions();
      handleClearSelection();
    } catch {
      toast.error("Erreur lors de la synchronisation des produits");
    }
  };

  const handleBulkGenerate = useCallback(
    async (type: BulkGenerationType) => {
      const selectedProducts = Array.from(selectedProductsMap.values());

      if (selectedProducts.length === 0) return;
      if (selectedProducts.length > 50) {
        toast.error("Maximum 50 produits par generation");
        return;
      }

      try {
        const result = await generateBulk({
          products: selectedProducts,
          shopId: storeId,
          type,
          storeSettings: settings,
        });
        toast.success(
          `${result.count} generation${result.count > 1 ? "s" : ""} lancee${result.count > 1 ? "s" : ""}`
        );
      } catch {
        toast.error("Erreur lors du lancement des generations");
      }
    },
    [selectedProductsMap, storeId, settings, generateBulk]
  );

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

      {/* Filters */}
      <ProductsFilters
        filters={filters}
        collections={collections}
        productTypes={filterOptions.productTypes}
        tags={filterOptions.tags}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
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
      {!isLoading && (
        <ProductsTable
          products={products}
          collections={collections}
          pagination={pagination}
          storeId={storeId}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectedProductIds={selectedProductIds}
          onSelectionChange={handleSelectionChange}
        />
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedProductIds.size}
        storeId={storeId}
        onClearSelection={handleClearSelection}
        onBulkGenerate={handleBulkGenerate}
        isGenerating={isGenerating}
        jobStates={jobStatesArray}
        generationType={generationType}
        totalCount={totalCount}
        completedCount={completedCount}
        failedCount={failedCount}
        doneCount={doneCount}
        hasActiveJobs={hasActiveJobs}
        onReset={resetBulk}
      />
    </div>
  );
}
