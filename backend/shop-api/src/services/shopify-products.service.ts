import { Prisma } from "../../generated/prisma";
import { prisma } from "../lib/prisma";
import { shopifyAdminGraphQL } from "../lib/shopify";
import { getStoreCredentials } from "./store.service";
import type {
  ShopifyGraphQLProductNode,
  SyncProductsResponse,
  ProductFilters,
  ShopifyProduct,
  ProductUpdateInput,
  ProductUpdateResponse,
  ProductPublishResponse,
} from "@seo-facile-de-ouf/shared/src/shopify-products";
import type { PaginatedResponse } from "@seo-facile-de-ouf/shared/src/api";

interface ShopifyGraphQLProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyGraphQLProductNode;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  };
}

async function fetchProductsFromShopify(
  shopifyDomain: string,
  accessToken: string,
  after: string | null = null,
  query: string | null = null,
): Promise<ShopifyGraphQLProductsResponse> {
  const graphqlQuery = `
    query GetProducts($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            status
            vendor
            productType
            tags
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                  sku
                  inventoryQuantity
                }
              }
            }
            createdAt
            updatedAt
            publishedAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = {
    first: 250,
    after,
    query,
  };

  const data = await shopifyAdminGraphQL<
    ShopifyGraphQLProductsResponse["data"]
  >(shopifyDomain, accessToken, graphqlQuery, variables);
  return { data };
}

async function fetchAllProducts(
  shopifyDomain: string,
  accessToken: string,
  filters?: ProductFilters,
): Promise<ShopifyGraphQLProductNode[]> {
  const allProducts: ShopifyGraphQLProductNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  // Build Shopify query string from filters
  let shopifyQuery: string | null = null;
  if (filters?.status) {
    shopifyQuery = `status:${filters.status}`;
  }

  while (hasNextPage) {
    const response = await fetchProductsFromShopify(
      shopifyDomain,
      accessToken,
      cursor,
      shopifyQuery,
    );

    if (response.data?.products?.edges) {
      const nodes = response.data.products.edges.map((edge) => edge.node);
      allProducts.push(...nodes);

      hasNextPage = response.data.products.pageInfo.hasNextPage;
      cursor = response.data.products.pageInfo.endCursor || null;
    } else {
      hasNextPage = false;
    }
  }

  return allProducts;
}

function transformProductNode(
  node: ShopifyGraphQLProductNode,
  storeId: string,
) {
  // Extract first variant data
  const firstVariant = node.variants.edges[0]?.node;
  const price = firstVariant ? parseFloat(firstVariant.price) : 0;
  const compareAtPrice = firstVariant?.compareAtPrice
    ? parseFloat(firstVariant.compareAtPrice)
    : null;

  // Extract collection GIDs
  const collectionIds = node.collections.edges.map((edge) => edge.node.id);

  return {
    shopifyGid: node.id,
    storeId,
    title: node.title,
    handle: node.handle,
    description: node.description || null,
    descriptionHtml: node.descriptionHtml || null,
    status: node.status,
    vendor: node.vendor || null,
    productType: node.productType || null,
    tags: node.tags,
    price,
    compareAtPrice,
    sku: firstVariant?.sku || null,
    imageUrl: node.featuredImage?.url || null,
    imageAlt: node.featuredImage?.altText || null,
    collectionIds,
    shopifyCreatedAt: new Date(node.createdAt),
    shopifyUpdatedAt: new Date(node.updatedAt),
    publishedAt: node.publishedAt ? new Date(node.publishedAt) : null,
  };
}

export async function syncProducts(
  storeId: string,
  userId: string,
): Promise<SyncProductsResponse> {
  // Verify user owns the store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.userId !== userId) {
    throw new Error("Unauthorized: User does not own this store");
  }

  // Get valid credentials
  const credentials = await getStoreCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store not found or access denied");
  }

  // Fetch all products from Shopify
  const productNodes = await fetchAllProducts(
    credentials.shopifyDomain,
    credentials.accessToken,
  );

  // Transform and upsert products
  const productsData = productNodes.map((node) =>
    transformProductNode(node, storeId),
  );

  // Upsert products
  for (const productData of productsData) {
    await prisma.shopifyProduct.upsert({
      where: {
        shopifyGid_storeId: {
          shopifyGid: productData.shopifyGid,
          storeId: productData.storeId,
        },
      },
      update: productData,
      create: productData,
    });
  }

  // Update lastSyncedAt on store
  await prisma.store.update({
    where: { id: storeId },
    data: { lastSyncedAt: new Date() },
  });

  return {
    success: true,
    productsCount: productsData.length,
    message: `Successfully synced ${productsData.length} products`,
    syncedAt: new Date(),
  };
}

export async function getProducts(
  storeId: string,
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters?: ProductFilters,
): Promise<PaginatedResponse<ShopifyProduct>> {
  // Verify user owns the store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.userId !== userId) {
    throw new Error("Unauthorized: User does not own this store");
  }

  // Build dynamic WHERE clause
  const where: Prisma.ShopifyProductWhereInput = {
    storeId,
    ...(filters?.collectionId && {
      collectionIds: {
        has: filters.collectionId,
      },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
    ...(filters?.status && { status: filters.status }),
  };

  const [products, total] = await Promise.all([
    prisma.shopifyProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shopifyProduct.count({ where }),
  ]);

  return {
    data: products as ShopifyProduct[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(
  storeId: string,
  productId: string,
  userId: string,
) {
  // Verify user owns the store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.userId !== userId) {
    throw new Error("Unauthorized: User does not own this store");
  }

  const product = await prisma.shopifyProduct.findFirst({
    where: {
      id: productId,
      storeId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function updateProduct(
  storeId: string,
  productId: string,
  userId: string,
  data: ProductUpdateInput,
): Promise<ProductUpdateResponse> {
  // Verify user owns the store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.userId !== userId) {
    throw new Error("Unauthorized: User does not own this store");
  }

  // Verify product exists
  const existingProduct = await prisma.shopifyProduct.findFirst({
    where: {
      id: productId,
      storeId,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Update product in database
  const updatedProduct = await prisma.shopifyProduct.update({
    where: { id: productId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && {
        descriptionHtml: data.descriptionHtml,
      }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return {
    success: true,
    product: updatedProduct as ShopifyProduct,
    message: "Product updated successfully",
  };
}

interface ShopifyProductUpdateResponse {
  productUpdate: {
    product: {
      id: string;
      updatedAt: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export async function publishProductToShopify(
  storeId: string,
  productId: string,
  userId: string,
  data: ProductUpdateInput,
): Promise<ProductPublishResponse> {
  // Verify user owns the store
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.userId !== userId) {
    throw new Error("Unauthorized: User does not own this store");
  }

  // Verify product exists and get shopifyGid
  const existingProduct = await prisma.shopifyProduct.findFirst({
    where: {
      id: productId,
      storeId,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Get store credentials
  const credentials = await getStoreCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store credentials not found");
  }

  // Update product locally first
  await prisma.shopifyProduct.update({
    where: { id: productId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && {
        descriptionHtml: data.descriptionHtml,
      }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  // Prepare Shopify mutation
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          updatedAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      id: existingProduct.shopifyGid,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && {
        descriptionHtml: data.descriptionHtml,
      }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.status !== undefined && { status: data.status }),
    },
  };

  // Call Shopify API
  const response = await shopifyAdminGraphQL<ShopifyProductUpdateResponse>(
    credentials.shopifyDomain,
    credentials.accessToken,
    mutation,
    variables,
  );

  if (response.productUpdate.userErrors.length > 0) {
    const errorMessages = response.productUpdate.userErrors
      .map((e) => e.message)
      .join(", ");
    throw new Error(`Shopify error: ${errorMessages}`);
  }

  if (!response.productUpdate.product) {
    throw new Error("Failed to update product on Shopify");
  }

  // Update shopifyUpdatedAt in database
  const shopifyUpdatedAt = new Date(response.productUpdate.product.updatedAt);
  const finalProduct = await prisma.shopifyProduct.update({
    where: { id: productId },
    data: { shopifyUpdatedAt },
  });

  return {
    success: true,
    product: finalProduct as ShopifyProduct,
    shopifyUpdatedAt,
    message: "Product published to Shopify successfully",
  };
}
