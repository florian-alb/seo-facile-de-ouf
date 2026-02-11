"use client";

import { useMemo } from "react";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import { useEntityList } from "./use-entity-list";

export function useShopifyCollections(storeId: string) {
  const options = useMemo(() => ({
    endpoint: `/shops/${storeId}/collections`,
    entityName: "collections",
  }), [storeId]);

  const {
    items: collections,
    fetchItems: fetchCollections,
    syncItems: syncCollections,
    ...rest
  } = useEntityList<ShopifyCollection>(options);

  return {
    collections,
    fetchCollections,
    syncCollections,
    ...rest,
  };
}
