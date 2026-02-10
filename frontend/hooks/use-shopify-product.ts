"use client";

import { useCallback, useMemo } from "react";
import type {
  ShopifyProduct,
  ProductUpdateInput,
} from "@seo-facile-de-ouf/shared/src/shopify-products";
import { useEntityCRUD } from "./use-entity-crud";

export function useShopifyProduct(storeId: string, productId: string) {
  const extractProduct = useCallback((res: any) => res.product as ShopifyProduct, []);

  const options = useMemo(() => ({
    endpoint: `/shops/${storeId}/products/${productId}`,
    entityName: "product",
    extractEntity: extractProduct,
  }), [storeId, productId, extractProduct]);

  const {
    entity: product,
    fetchEntity: fetchProduct,
    updateEntity: updateProduct,
    publishEntity: publishProduct,
    syncEntity: syncProduct,
    ...rest
  } = useEntityCRUD<ShopifyProduct, ProductUpdateInput>(options);

  return {
    product,
    fetchProduct,
    updateProduct,
    publishProduct,
    syncProduct,
    ...rest,
  };
}
