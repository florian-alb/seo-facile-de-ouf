"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { SyncButton } from "@/components/common/sync-button";
import { CollectionsTable } from "@/components/collections/collections-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"

export default function CollectionsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const {
    collections,
    pagination,
    isLoading,
    isSyncing,
    error,
    fetchCollections,
    setPage,
    setPageSize,
    syncCollections,
  } = useShopifyCollections(storeId);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSync = async () => {
    try {
      const result = await syncCollections();
      toast("Synchronisation réussie", {
        description: result.message,
      });
    } catch (err) {
      console.error(err)
      toast.error("Erreur de synchronisation", {
        description: "Impossible de synchroniser les collections",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Gérez les collections de votre boutique Shopify
          </p>
        </div>
        <SyncButton onSync={handleSync} isSyncing={isSyncing} />
      </div>

      {error && !isLoading && !isSyncing && (
        <div className="container mx-auto py-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {isLoading && collections.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <CollectionsTable
          storeId={storeId}
          collections={collections}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {pagination.total > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          {pagination.total} collection{pagination.total > 1 ? "s" : ""}{" "}
          synchronisée{pagination.total > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
