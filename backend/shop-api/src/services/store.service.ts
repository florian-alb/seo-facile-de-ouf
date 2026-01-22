import { prisma } from "../lib/prisma";
import { encrypt } from "../lib/encryption";

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
  createdAt: Date;
  updatedAt: Date;
}

export async function createStore(
  userId: string,
  input: CreateStoreInput
): Promise<StoreResponse> {
  const store = await prisma.store.create({
    data: {
      userId,
      name: input.name,
      url: input.url,
      shopifyDomain: input.shopifyDomain,
      language: input.language,
      encryptedClientId: encrypt(input.clientId),
      encryptedClientSecret: encrypt(input.clientSecret),
    },
  });

  return mapStoreToResponse(store);
}

export async function getStoresByUserId(
  userId: string
): Promise<StoreResponse[]> {
  const stores = await prisma.store.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return stores.map(mapStoreToResponse);
}

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

export async function updateStore(
  storeId: string,
  userId: string,
  input: UpdateStoreInput
): Promise<StoreResponse | null> {
  const existing = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!existing) return null;

  const updateData: Record<string, string> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.url !== undefined) updateData.url = input.url;
  if (input.shopifyDomain !== undefined)
    updateData.shopifyDomain = input.shopifyDomain;
  if (input.language !== undefined) updateData.language = input.language;
  if (input.clientId !== undefined)
    updateData.encryptedClientId = encrypt(input.clientId);
  if (input.clientSecret !== undefined)
    updateData.encryptedClientSecret = encrypt(input.clientSecret);

  const store = await prisma.store.update({
    where: { id: storeId },
    data: updateData,
  });

  return mapStoreToResponse(store);
}

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
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}
