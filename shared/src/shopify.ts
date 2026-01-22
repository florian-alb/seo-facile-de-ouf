// Types
export interface ShopifyCredentials {
  shopifyDomain: string;
  accessToken: string;
}

export interface ShopifyCollection {
  id: string;
  shopifyGid: string;
  legacyResourceId: string;
  storeId: string;
  title: string;
  handle: string;
  productsCount: number;
  description?: string;
  descriptionHtml?: string;
  imageUrl?: string;
  imageAlt?: string;
  sortOrder?: string;
  isSmartCollection: boolean;
  publishedOnCurrentPublication: boolean;
  shopifyUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncCollectionsResponse {
  success: boolean;
  collectionsCount: number;
  message: string;
  syncedAt: Date;
}

export interface ShopifyGraphQLCollectionNode {
  id: string;
  legacyResourceId: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  image?: {
    url: string;
    altText?: string;
  };
  productsCount: {
    count: number;
  };
  sortOrder?: string;
  ruleSet?: {
    appliedDisjunctively: boolean;
  };
  publishedOnCurrentPublication: boolean;
  updatedAt: string;
}

export interface ShopifyGraphQLCollectionsResponse {
  data: {
    collections: {
      edges: Array<{
        node: ShopifyGraphQLCollectionNode;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  };
}
