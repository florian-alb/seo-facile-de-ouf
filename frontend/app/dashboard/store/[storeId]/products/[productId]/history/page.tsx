"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useShopifyProduct } from "@/hooks/use-shopify-product";
import { useGenerationHistory } from "@/hooks/use-generation-history";
import { EntityTabs } from "@/components/shared/entity-tabs";
import { GenerationHistoryList } from "@/components/history/generation-history-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ProductHistoryPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const productId = params.productId as string;

  const { product, isLoading: productLoading, fetchProduct } = useShopifyProduct(storeId, productId);
  const { generations, isLoading: historyLoading, error, fetchGenerations } = useGenerationHistory("product", productId);

  useEffect(() => {
    fetchProduct();
    fetchGenerations();
  }, [storeId, productId]);

  const basePath = `/dashboard/store/${storeId}/products/${productId}`;
  const isLoading = productLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/store/${storeId}/products`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold line-clamp-1">
            {product?.title || "Produit"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {product?.handle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <EntityTabs basePath={basePath} />

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : generations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune génération pour ce produit.
        </div>
      ) : (
        <GenerationHistoryList generations={generations} basePath={basePath} />
      )}
    </div>
  );
}
