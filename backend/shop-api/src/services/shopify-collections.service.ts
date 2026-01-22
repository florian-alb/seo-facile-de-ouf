import { prisma } from "../lib/prisma";
import { decrypt } from "../lib/encryption";
import { shopifyAdminGraphQL } from "../lib/shopify";
import type {
  ShopifyGraphQLCollectionsResponse,
  ShopifyGraphQLCollectionNode,
  SyncCollectionsResponse,
  ShopifyCredentials,
} from "@seo-facile-de-ouf/shared/src/shopify";

async function getShopifyCredentials(
  storeId: string,
  userId: string
): Promise<ShopifyCredentials | null> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) return null;

  // If we have an access token, use it (OAuth flow)
  if (store.encryptedAccessToken) {
    const accessToken = decrypt(store.encryptedAccessToken);
    return {
      shopifyDomain: store.shopifyDomain,
      accessToken,
    };
  }

  // Fallback: use clientSecret as access token (for custom apps)
  const accessToken = decrypt(store.encryptedClientSecret);

  return {
    shopifyDomain: store.shopifyDomain,
    accessToken,
  };
}

async function fetchCollectionsFromShopify(
  credentials: ShopifyCredentials,
  after: string | null = null
): Promise<ShopifyGraphQLCollectionsResponse> {
  const query = `
    query GetCollections($first: Int!, $after: String) {
      collections(first: $first, after: $after) {
        edges {
          node {
            id
            legacyResourceId
            title
            handle
            description
            descriptionHtml
            image {
              url
              altText
            }
            productsCount {
              count
            }
            sortOrder
            ruleSet {
              appliedDisjunctively
            }
            publishedOnCurrentPublication
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

  const data = await shopifyAdminGraphQL<ShopifyGraphQLCollectionsResponse["data"]>(
    credentials,
    query,
    variables
  );

  return { data };
}

async function fetchAllCollections(
  credentials: ShopifyCredentials
): Promise<ShopifyGraphQLCollectionNode[]> {
  const allCollections: ShopifyGraphQLCollectionNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fetchCollectionsFromShopify(credentials, cursor);

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
  storeId: string
) {
  return {
    shopifyGid: node.id,
    legacyResourceId: node.legacyResourceId,
    storeId,
    title: node.title,
    handle: node.handle,
    productsCount: node.productsCount.count,
    description: node.description || null,
    descriptionHtml: node.descriptionHtml || null,
    imageUrl: node.image?.url || null,
    imageAlt: node.image?.altText || null,
    sortOrder: node.sortOrder || null,
    publishedOnCurrentPublication: node.publishedOnCurrentPublication,
    isSmartCollection: !!node.ruleSet,
    shopifyUpdatedAt: new Date(node.updatedAt),
  };
}

export async function syncCollections(
  storeId: string,
  userId: string
): Promise<SyncCollectionsResponse> {
  const credentials = await getShopifyCredentials(storeId, userId);

  if (!credentials) {
    throw new Error("Store not found or access denied");
  }

  const collections = await fetchAllCollections(credentials);

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
        productsCount: collectionData.productsCount,
        description: collectionData.description,
        descriptionHtml: collectionData.descriptionHtml,
        imageUrl: collectionData.imageUrl,
        imageAlt: collectionData.imageAlt,
        sortOrder: collectionData.sortOrder,
        publishedOnCurrentPublication:
          collectionData.publishedOnCurrentPublication,
        isSmartCollection: collectionData.isSmartCollection,
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

export async function getCollections(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  const collections = await prisma.shopifyCollection.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  return collections;
}

export async function getCollectionById(
  storeId: string,
  collectionId: string,
  userId: string
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
