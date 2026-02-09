"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useShopifyProduct } from "@/hooks/use-shopify-product";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import { ProductDetailContent } from "@/components/products/product-detail-content";

export default function ProductDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const productId = params.productId as string;

  const {
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
  } = useShopifyProduct(storeId, productId);

  const { collections, fetchCollections } = useShopifyCollections(storeId);

  useEffect(() => {
    fetchProduct();
    fetchCollections(1, 100);
  }, [storeId, productId]);

  return (
    <ProductDetailContent
      product={product}
      formProduct={product}
      collections={collections}
      storeId={storeId}
      productId={productId}
      isLoading={isLoading}
      isSaving={isSaving}
      isPublishing={isPublishing}
      isSyncing={isSyncing}
      error={error}
      backHref={`/dashboard/store/${storeId}/products`}
      currentPagePath={`/dashboard/store/${storeId}/products/${productId}`}
      onRetry={fetchProduct}
      onUpdateProduct={updateProduct}
      onPublishProduct={publishProduct}
      onSyncProduct={syncProduct}
    />
  );
}
