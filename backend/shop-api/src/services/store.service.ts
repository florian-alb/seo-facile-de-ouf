import { prisma } from "../lib/prisma";
import { exchangeTokenWithShopify, isTokenExpired } from "./token.service";

export interface CreateStoreInput {
  name: string;
  url: string;
  shopifyDomain: string;
  language: string;
  clientId: string;
  clientSecret: string;
}

export interface UpdateStoreInput {
  name?: string;
  url?: string;
  shopifyDomain?: string;
  language?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface StoreResponse {
  id: string;
  userId: string;
  name: string;
  url: string;
  shopifyDomain: string;
  language: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new store and exchange credentials for access token
 */
export async function createStore(
  userId: string,
  input: CreateStoreInput
): Promise<StoreResponse> {
  // Create store with pending status
  const store = await prisma.store.create({
    data: {
      userId,
      name: input.name,
      url: input.url,
      shopifyDomain: input.shopifyDomain,
      language: input.language,
      clientId: input.clientId,
      clientSecret: input.clientSecret,
      status: "pending",
    },
  });

  // Exchange credentials for access token
  try {
    const { accessToken, expiresAt } = await exchangeTokenWithShopify(
      input.shopifyDomain,
      input.clientId,
      input.clientSecret
    );

    // Update store with token
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        accessToken,
        tokenExpiresAt: expiresAt,
        status: "connected",
      },
    });

    return mapStoreToResponse(updatedStore);
  } catch (error) {
    // Mark store as error
    await prisma.store.update({
      where: { id: store.id },
      data: { status: "error" },
    });
    throw error;
  }
}

/**
 * Get all stores for a user
 */
export async function getStoresByUserId(
  userId: string
): Promise<StoreResponse[]> {
  const stores = await prisma.store.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return stores.map(mapStoreToResponse);
}

/**
 * Get a specific store by ID
 */
export async function getStoreById(
  storeId: string,
  userId: string
): Promise<StoreResponse | null> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) return null;
  return mapStoreToResponse(store);
}

/**
 * Get store credentials with access token
 * Automatically refreshes token if expired
 */
export async function getStoreCredentials(
  storeId: string,
  userId: string
): Promise<{ shopifyDomain: string; accessToken: string } | null> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) return null;

  // Check if token needs refresh
  if (isTokenExpired(store.tokenExpiresAt)) {
    try {
      const { accessToken, expiresAt } = await exchangeTokenWithShopify(
        store.shopifyDomain,
        store.clientId,
        store.clientSecret
      );

      // Update store with new token
      await prisma.store.update({
        where: { id: storeId },
        data: {
          accessToken,
          tokenExpiresAt: expiresAt,
          status: "connected",
        },
      });

      return {
        shopifyDomain: store.shopifyDomain,
        accessToken,
      };
    } catch (error) {
      // Mark store as error
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "error" },
      });
      throw error;
    }
  }

  // Token is still valid
  if (!store.accessToken) {
    throw new Error("Store has no access token");
  }

  return {
    shopifyDomain: store.shopifyDomain,
    accessToken: store.accessToken,
  };
}

/**
 * Update store information
 */
export async function updateStore(
  storeId: string,
  userId: string,
  input: UpdateStoreInput
): Promise<StoreResponse | null> {
  const existing = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!existing) return null;

  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.url !== undefined) updateData.url = input.url;
  if (input.shopifyDomain !== undefined)
    updateData.shopifyDomain = input.shopifyDomain;
  if (input.language !== undefined) updateData.language = input.language;

  // If credentials are updated, re-exchange for token
  if (input.clientId !== undefined || input.clientSecret !== undefined) {
    const clientId = input.clientId || existing.clientId;
    const clientSecret = input.clientSecret || existing.clientSecret;

    updateData.clientId = clientId;
    updateData.clientSecret = clientSecret;

    try {
      const { accessToken, expiresAt } = await exchangeTokenWithShopify(
        input.shopifyDomain || existing.shopifyDomain,
        clientId,
        clientSecret
      );

      updateData.accessToken = accessToken;
      updateData.tokenExpiresAt = expiresAt;
      updateData.status = "connected";
    } catch (error) {
      updateData.status = "error";
    }
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: updateData,
  });

  return mapStoreToResponse(store);
}

/**
 * Delete a store
 */
export async function deleteStore(
  storeId: string,
  userId: string
): Promise<boolean> {
  const existing = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!existing) return false;

  await prisma.store.delete({
    where: { id: storeId },
  });

  return true;
}

function mapStoreToResponse(store: {
  id: string;
  userId: string;
  name: string;
  url: string;
  shopifyDomain: string;
  language: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): StoreResponse {
  return {
    id: store.id,
    userId: store.userId,
    name: store.name,
    url: store.url,
    shopifyDomain: store.shopifyDomain,
    language: store.language,
    status: store.status,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}
