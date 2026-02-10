"use client";

import { useCallback, useMemo } from "react";
import type {
  ShopifyCollection,
  CollectionUpdateInput,
} from "@seo-facile-de-ouf/shared/src/shopify-collections";
import { useEntityCRUD } from "./use-entity-crud";

export function useShopifyCollection(storeId: string, collectionId: string) {
  const extractCollection = useCallback((res: any) => res.collection as ShopifyCollection, []);

  const options = useMemo(() => ({
    endpoint: `/shops/${storeId}/collections/${collectionId}`,
    entityName: "collection",
    extractEntity: extractCollection,
  }), [storeId, collectionId, extractCollection]);

  const {
    entity: collection,
    fetchEntity: fetchCollection,
    updateEntity: updateCollection,
    publishEntity: publishCollection,
    syncEntity: syncCollection,
    ...rest
  } = useEntityCRUD<ShopifyCollection, CollectionUpdateInput>(options);

  return {
    collection,
    fetchCollection,
    updateCollection,
    publishCollection,
    syncCollection,
    ...rest,
  };
}
