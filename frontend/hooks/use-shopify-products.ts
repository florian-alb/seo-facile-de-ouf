"use client";

import { useCallback, useMemo } from "react";
import type {
  ShopifyProduct,
  ProductFilters,
} from "@seo-facile-de-ouf/shared/src/shopify-products";
import { useEntityList } from "./use-entity-list";

export function useShopifyProducts(storeId: string) {
  const buildParams = useCallback((filters?: ProductFilters) => {
    const params: Record<string, string> = {};
    if (filters?.collectionId) params.collectionId = filters.collectionId;
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.productType) params.productType = filters.productType;
    if (filters?.tag) params.tag = filters.tag;
    return params;
  }, []);

  const options = useMemo(() => ({
    endpoint: `/shops/${storeId}/products`,
    entityName: "products",
    buildParams,
  }), [storeId, buildParams]);

  const {
    items: products,
    fetchItems: fetchProducts,
    syncItems: syncProducts,
    ...rest
  } = useEntityList<ShopifyProduct, ProductFilters>(options);

  return {
    products,
    fetchProducts,
    syncProducts,
    ...rest,
  };
}
