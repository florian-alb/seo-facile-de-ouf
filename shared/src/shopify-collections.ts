export interface ShopifyCollection {
  id: string;
  shopifyGid: string;
  storeId: string;
  title: string;
  handle: string;
  descriptionHtml: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  productsCount: number;
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
  title: string;
  handle: string;
  descriptionHtml?: string;
  image?: {
    url: string;
    altText?: string;
  };
  seo?: {
    description?: string;
    title?: string;
  };
  productsCount: {
    count: number;
  };
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
