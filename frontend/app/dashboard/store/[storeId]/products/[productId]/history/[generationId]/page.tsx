"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Calendar, Sparkles } from "lucide-react";

import { useShopifyProduct } from "@/hooks/use-shopify-product";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { useGenerationDetail } from "@/hooks/use-generation-history";
import { ProductDetailContent } from "@/components/products/product-detail-content";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";

const FIELD_TYPE_LABELS: Record<string, string> = {
  description: "Description",
  seoTitle: "Titre SEO",
  seoDescription: "Description SEO",
  full_description: "Description complète",
  meta_only: "Meta uniquement",
  slug_only: "Slug uniquement",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

export default function ProductHistoryDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const productId = params.productId as string;
  const generationId = params.generationId as string;

  const {
    product,
    isLoading: productLoading,
    isSaving,
    isPublishing,
    isSyncing,
    error: productError,
    fetchProduct,
    updateProduct,
    publishProduct,
    syncProduct,
  } = useShopifyProduct(storeId, productId);

  const { collections, fetchCollections } = useShopifyCollections(storeId);

  const {
    generation,
    isLoading: generationLoading,
    error: generationError,
    fetchGeneration,
  } = useGenerationDetail(generationId);

  useEffect(() => {
    fetchProduct();
    fetchCollections(1, 100);
    fetchGeneration();
  }, [storeId, productId, generationId]);

  const virtualProduct = useMemo<ShopifyProduct | null>(() => {
    if (!product || !generation?.content) return null;

    return {
      ...product,
      title: generation.content.title || product.title,
      descriptionHtml: generation.content.description || product.descriptionHtml,
      seoTitle: generation.content.metaTitle || product.seoTitle,
      seoDescription: generation.content.metaDescription || product.seoDescription,
    };
  }, [product, generation]);

  const basePath = `/dashboard/store/${storeId}/products/${productId}`;

  const banner = generation ? (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Génération historique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary">
            {FIELD_TYPE_LABELS[generation.fieldType] || generation.fieldType}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(generation.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  ) : null;

  return (
    <ProductDetailContent
      product={product}
      formProduct={virtualProduct}
      collections={collections}
      storeId={storeId}
      productId={productId}
      isLoading={productLoading || generationLoading}
      isSaving={isSaving}
      isPublishing={isPublishing}
      isSyncing={isSyncing}
      error={productError || generationError}
      backHref={`${basePath}/history`}
      currentPagePath={`${basePath}/history/${generationId}`}
      onRetry={() => { fetchProduct(); fetchGeneration(); }}
      onUpdateProduct={updateProduct}
      onPublishProduct={publishProduct}
      onSyncProduct={syncProduct}
      banner={banner}
    />
  );
}
