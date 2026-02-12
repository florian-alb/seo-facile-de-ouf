import { prisma } from "../lib/prisma";
import {
  exchangeCodeForToken,
  buildAuthorizeUrl,
  generateNonce,
  buildSignedState,
} from "./token.service";
import { encrypt, decrypt } from "@seo-facile-de-ouf/backend-shared";

export interface CreateStoreInput {
  name: string;
  url: string;
  shopifyDomain: string;
  language: string;
}

export interface UpdateStoreInput {
  name?: string;
  url?: string;
  language?: string;
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

export interface CreateStoreResult {
  store: StoreResponse;
  oauthUrl: string;
}

const REDIRECT_URI = `${process.env.SHOPIFY_HOST_NAME || "http://localhost:4000"}/shopify/auth/callback`;

/**
 * Create a new store (pending) and return OAuth authorize URL
 */
export async function createStore(
  userId: string,
  input: CreateStoreInput
): Promise<CreateStoreResult> {
  const nonce = generateNonce();

  const store = await prisma.store.create({
    data: {
      userId,
      name: input.name,
      url: input.url,
      shopifyDomain: input.shopifyDomain,
      language: input.language,
      status: "pending",
      nonce,
    },
  });

  const state = buildSignedState(store.id, nonce);
  const oauthUrl = buildAuthorizeUrl(input.shopifyDomain, REDIRECT_URI, state);

  return {
    store: mapStoreToResponse(store),
    oauthUrl,
  };
}

/**
 * Complete OAuth callback: verify nonce, exchange code, store token
 */
export async function completeOAuthCallback(
  storeId: string,
  nonce: string,
  code: string
): Promise<StoreResponse> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });

  if (!store) throw new Error("Store not found");
  if (store.nonce !== nonce)
    throw new Error("Invalid nonce - possible replay attack");
  if (store.status === "connected")
    throw new Error("Store already connected");

  try {
    const accessToken = await exchangeCodeForToken(store.shopifyDomain, code);

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        accessToken: encrypt(accessToken),
        status: "connected",
        nonce: null,
      },
    });

    return mapStoreToResponse(updated);
  } catch (error) {
    await prisma.store.update({
      where: { id: storeId },
      data: { status: "error", nonce: null },
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
 * Offline tokens are permanent — no refresh needed
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

  if (!store.accessToken) {
    throw new Error("Store has no access token — OAuth not completed");
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

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.url !== undefined) updateData.url = input.url;
  if (input.language !== undefined) updateData.language = input.language;

  const store = await prisma.store.update({
    where: { id: storeId },
    data: updateData,
  });

  return mapStoreToResponse(store);
}

/**
 * Re-initiate OAuth for a store (e.g., after disconnection or error)
 */
export async function initiateReconnect(
  storeId: string,
  userId: string
): Promise<{ oauthUrl: string }> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) throw new Error("Store not found");

  const nonce = generateNonce();
  await prisma.store.update({
    where: { id: storeId },
    data: { nonce, status: "pending", accessToken: null },
  });

  const state = buildSignedState(storeId, nonce);
  const oauthUrl = buildAuthorizeUrl(store.shopifyDomain, REDIRECT_URI, state);

  return { oauthUrl };
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

/**
 * Disconnect a store (called by APP_UNINSTALLED webhook)
 */
export async function disconnectStore(shopifyDomain: string): Promise<void> {
  await prisma.store.updateMany({
    where: { shopifyDomain },
    data: { status: "error", accessToken: null },
  });
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
