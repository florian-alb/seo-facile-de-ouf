import { prisma } from "../lib/prisma";
import { exchangeTokenWithShopify, isTokenExpired } from "./token.service";
import { encrypt, decrypt } from "../lib/encryption";

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
      clientId: encrypt(input.clientId),
      clientSecret: encrypt(input.clientSecret),
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

    // Update store with token (encrypted)
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        accessToken: encrypt(accessToken),
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

  // Decrypt credentials for use
  const decryptedClientId = decrypt(store.clientId);
  const decryptedClientSecret = decrypt(store.clientSecret);

  // Check if token needs refresh
  if (isTokenExpired(store.tokenExpiresAt)) {
    try {
      const { accessToken, expiresAt } = await exchangeTokenWithShopify(
        store.shopifyDomain,
        decryptedClientId,
        decryptedClientSecret
      );

      // Update store with new token (encrypted)
      await prisma.store.update({
        where: { id: storeId },
        data: {
          accessToken: encrypt(accessToken),
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

  // Token is still valid - decrypt it
  if (!store.accessToken) {
    throw new Error("Store has no access token");
  }

  return {
    shopifyDomain: store.shopifyDomain,
    accessToken: decrypt(store.accessToken),
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
    // Decrypt existing credentials if not updating them
    const clientId =
      input.clientId !== undefined
        ? input.clientId
        : decrypt(existing.clientId);
    const clientSecret =
      input.clientSecret !== undefined
        ? input.clientSecret
        : decrypt(existing.clientSecret);

    // Encrypt new credentials
    updateData.clientId = encrypt(clientId);
    updateData.clientSecret = encrypt(clientSecret);

    try {
      const { accessToken, expiresAt } = await exchangeTokenWithShopify(
        input.shopifyDomain || existing.shopifyDomain,
        clientId,
        clientSecret
      );

      updateData.accessToken = encrypt(accessToken);
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
