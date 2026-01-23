// Types
export interface ShopifyCredentials {
  shopifyDomain: string;
  accessToken: string;
}

export interface ShopifyCollection {
  id: string;
  shopifyGid: string;
  storeId: string;
  title: string;
  handle: string;
  descriptionHtml?: string;
  imageUrl?: string;
  imageAlt?: string;
  seoDescription?: string;
  seoTitle?: string;
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

// Product types
export interface ShopifyProduct {
  id: string;
  shopifyGid: string;
  storeId: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  vendor?: string;
  productType?: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  totalInventory: number;
  sku?: string;
  imageUrl?: string;
  imageAlt?: string;
  collectionIds: string[];
  shopifyCreatedAt: Date;
  shopifyUpdatedAt: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  collectionId?: string;
  search?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  minPrice?: number;
  maxPrice?: number;
}

export interface SyncProductsResponse {
  success: boolean;
  productsCount: number;
  message: string;
  syncedAt: Date;
}

// GraphQL response types
export interface ShopifyGraphQLProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  status: string;
  totalInventory: number;
  vendor?: string;
  productType?: string;
  tags: string[];
  collections: {
    edges: Array<{
      node: {
        id: string;
        title: string;
      };
    }>;
  };
  featuredImage?: {
    url: string;
    altText?: string;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: string;
        compareAtPrice?: string;
        sku?: string;
        inventoryQuantity: number;
      };
    }>;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
