export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface ShopifyProduct {
  id: string;
  shopifyGid: string;
  storeId: string;
  title: string;
  handle: string;
  description: string | null;
  descriptionHtml: string | null;
  status: ProductStatus;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  collectionIds: string[];
  shopifyCreatedAt: Date;
  shopifyUpdatedAt: Date;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  collectionId?: string;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface SyncProductsResponse {
  success: boolean;
  productsCount: number;
  message: string;
  syncedAt: Date;
}

export interface ShopifyGraphQLProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  status: string;
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

export interface ProductUpdateInput {
  title?: string;
  descriptionHtml?: string;
  handle?: string;
  tags?: string[];
  imageAlt?: string;
  status?: ProductStatus;
}

export interface ProductUpdateResponse {
  success: boolean;
  product: ShopifyProduct;
  message: string;
}

export interface ProductPublishResponse {
  success: boolean;
  product: ShopifyProduct;
  shopifyUpdatedAt: Date;
  message: string;
}
