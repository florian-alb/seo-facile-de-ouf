import { prisma } from "../lib/prisma";
import { shopifyAdminGraphQL } from "../lib/shopify";
import { getStoreCredentials } from "./store.service";
import type {
  ShopifyGraphQLCollectionsResponse,
  ShopifyGraphQLCollectionNode,
  SyncCollectionsResponse,
  ShopifyCollection,
  CollectionUpdateInput,
  CollectionUpdateResponse,
  CollectionPublishResponse,
} from "@seo-facile-de-ouf/shared/src/shopify-collections";
import type { PaginatedResponse } from "@seo-facile-de-ouf/shared/src/api";

async function fetchCollectionsFromShopify(
  shopifyDomain: string,
  accessToken: string,
  after: string | null = null,
): Promise<ShopifyGraphQLCollectionsResponse> {
  const query = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          image {
            url
            altText
          }
          seo {
            description
            title
          }
          productsCount {
            count
          }
          updatedAt
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
  };

  const data = await shopifyAdminGraphQL<
    ShopifyGraphQLCollectionsResponse["data"]
  >(shopifyDomain, accessToken, query, variables);
  return { data };
}

async function fetchAllCollections(
  shopifyDomain: string,
  accessToken: string,
): Promise<ShopifyGraphQLCollectionNode[]> {
  const allCollections: ShopifyGraphQLCollectionNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fetchCollectionsFromShopify(
      shopifyDomain,
      accessToken,
      cursor,
    );

    if (response.data?.collections?.edges) {
      const nodes = response.data.collections.edges.map((edge) => edge.node);
      allCollections.push(...nodes);

      hasNextPage = response.data.collections.pageInfo.hasNextPage;
      cursor = response.data.collections.pageInfo.endCursor || null;
    } else {
      hasNextPage = false;
    }
  }

  return allCollections;
}

function transformCollectionNode(
  node: ShopifyGraphQLCollectionNode,
  storeId: string,
) {
  return {
    shopifyGid: node.id,
    storeId,
    title: node.title,
    handle: node.handle,
    descriptionHtml: node.descriptionHtml || null,
    imageUrl: node.image?.url || null,
    imageAlt: node.image?.altText || null,
    seoDescription: node.seo?.description || null,
    seoTitle: node.seo?.title || null,
    productsCount: node.productsCount.count,
    shopifyUpdatedAt: new Date(node.updatedAt),
  };
}

export async function syncCollections(
  storeId: string,
  userId: string,
): Promise<SyncCollectionsResponse> {
  const credentials = await getStoreCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store not found or access denied");
  }

  const collections = await fetchAllCollections(
    credentials.shopifyDomain,
    credentials.accessToken,
  );

  for (const node of collections) {
    const collectionData = transformCollectionNode(node, storeId);

    await prisma.shopifyCollection.upsert({
      where: {
        shopifyGid_storeId: {
          shopifyGid: collectionData.shopifyGid,
          storeId: collectionData.storeId,
        },
      },
      update: {
        title: collectionData.title,
        handle: collectionData.handle,
        descriptionHtml: collectionData.descriptionHtml,
        imageUrl: collectionData.imageUrl,
        imageAlt: collectionData.imageAlt,
        seoDescription: collectionData.seoDescription,
        seoTitle: collectionData.seoTitle,
        productsCount: collectionData.productsCount,
        shopifyUpdatedAt: collectionData.shopifyUpdatedAt,
      },
      create: collectionData,
    });
  }

  const syncedAt = new Date();
  await prisma.store.update({
    where: { id: storeId },
    data: { lastSyncedAt: syncedAt },
  });

  return {
    success: true,
    collectionsCount: collections.length,
    message: `Successfully synced ${collections.length} collections`,
    syncedAt,
  };
}

export async function getCollections(
  storeId: string,
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<ShopifyCollection>> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const [collections, total] = await Promise.all([
    prisma.shopifyCollection.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shopifyCollection.count({
      where: { storeId },
    }),
  ]);

  return {
    data: collections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCollectionById(
  storeId: string,
  collectionId: string,
  userId: string,
) {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const collection = await prisma.shopifyCollection.findFirst({
    where: {
      id: collectionId,
      storeId,
    },
  });

  return collection;
}

export async function updateCollection(
  storeId: string,
  collectionId: string,
  userId: string,
  data: CollectionUpdateInput,
): Promise<CollectionUpdateResponse> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const existingCollection = await prisma.shopifyCollection.findFirst({
    where: { id: collectionId, storeId },
  });

  if (!existingCollection) {
    throw new Error("Collection not found");
  }

  const updatedCollection = await prisma.shopifyCollection.update({
    where: { id: collectionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && { descriptionHtml: data.descriptionHtml }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
    },
  });

  return {
    success: true,
    collection: updatedCollection as ShopifyCollection,
    message: "Collection updated successfully",
  };
}

interface ShopifyCollectionUpdateResponse {
  collectionUpdate: {
    collection: {
      id: string;
      updatedAt: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export async function publishCollectionToShopify(
  storeId: string,
  collectionId: string,
  userId: string,
  data: CollectionUpdateInput,
): Promise<CollectionPublishResponse> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const existingCollection = await prisma.shopifyCollection.findFirst({
    where: { id: collectionId, storeId },
  });

  if (!existingCollection) {
    throw new Error("Collection not found");
  }

  const credentials = await getStoreCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store credentials not found");
  }

  // Update collection locally first
  await prisma.shopifyCollection.update({
    where: { id: collectionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && { descriptionHtml: data.descriptionHtml }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
    },
  });

  const mutation = `
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
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
      id: existingCollection.shopifyGid,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.descriptionHtml !== undefined && { descriptionHtml: data.descriptionHtml }),
      ...(data.handle !== undefined && { handle: data.handle }),
      ...((data.seoTitle !== undefined || data.seoDescription !== undefined) && {
        seo: {
          ...(data.seoTitle !== undefined && { title: data.seoTitle }),
          ...(data.seoDescription !== undefined && { description: data.seoDescription }),
        },
      }),
    },
  };

  const response = await shopifyAdminGraphQL<ShopifyCollectionUpdateResponse>(
    credentials.shopifyDomain,
    credentials.accessToken,
    mutation,
    variables,
  );

  if (response.collectionUpdate.userErrors.length > 0) {
    const errorMessages = response.collectionUpdate.userErrors
      .map((e) => e.message)
      .join(", ");
    throw new Error(`Shopify error: ${errorMessages}`);
  }

  if (!response.collectionUpdate.collection) {
    throw new Error("Failed to update collection on Shopify");
  }

  const shopifyUpdatedAt = new Date(response.collectionUpdate.collection.updatedAt);
  const finalCollection = await prisma.shopifyCollection.update({
    where: { id: collectionId },
    data: { shopifyUpdatedAt },
  });

  return {
    success: true,
    collection: finalCollection as ShopifyCollection,
    shopifyUpdatedAt,
    message: "Collection published to Shopify successfully",
  };
}

interface ShopifyGraphQLSingleCollectionResponse {
  collection: ShopifyGraphQLCollectionNode | null;
}

async function fetchSingleCollectionFromShopify(
  shopifyDomain: string,
  accessToken: string,
  shopifyGid: string,
): Promise<ShopifyGraphQLCollectionNode | null> {
  const query = `
    query GetCollection($id: ID!) {
      collection(id: $id) {
        id
        title
        handle
        descriptionHtml
        image {
          url
          altText
        }
        seo {
          description
          title
        }
        productsCount {
          count
        }
        updatedAt
      }
    }
  `;

  const data = await shopifyAdminGraphQL<ShopifyGraphQLSingleCollectionResponse>(
    shopifyDomain,
    accessToken,
    query,
    { id: shopifyGid },
  );

  return data.collection;
}

export async function syncSingleCollection(
  storeId: string,
  collectionId: string,
  userId: string,
): Promise<CollectionUpdateResponse> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const existingCollection = await prisma.shopifyCollection.findFirst({
    where: { id: collectionId, storeId },
  });

  if (!existingCollection) {
    throw new Error("Collection not found");
  }

  const credentials = await getStoreCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store credentials not found");
  }

  const collectionNode = await fetchSingleCollectionFromShopify(
    credentials.shopifyDomain,
    credentials.accessToken,
    existingCollection.shopifyGid,
  );

  if (!collectionNode) {
    throw new Error("Collection not found on Shopify");
  }

  const collectionData = transformCollectionNode(collectionNode, storeId);

  const updatedCollection = await prisma.shopifyCollection.update({
    where: { id: collectionId },
    data: {
      title: collectionData.title,
      handle: collectionData.handle,
      descriptionHtml: collectionData.descriptionHtml,
      imageUrl: collectionData.imageUrl,
      imageAlt: collectionData.imageAlt,
      seoDescription: collectionData.seoDescription,
      seoTitle: collectionData.seoTitle,
      productsCount: collectionData.productsCount,
      shopifyUpdatedAt: collectionData.shopifyUpdatedAt,
    },
  });

  return {
    success: true,
    collection: updatedCollection as ShopifyCollection,
    message: "Collection synced from Shopify successfully",
  };
}
