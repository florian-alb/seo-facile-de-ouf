import { prisma } from "../lib/prisma";
import type { StoreSettingsInput } from "@seo-facile-de-ouf/shared/src/store-settings";

type PartialSettingsInput = Partial<StoreSettingsInput>;

export async function getSettings(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { storeId },
  });

  return settings;
}

export async function upsertSettings(
  storeId: string,
  userId: string,
  input: PartialSettingsInput
) {
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const data = {
    ...(input.nicheKeyword !== undefined && { nicheKeyword: input.nicheKeyword }),
    ...(input.nicheDescription !== undefined && { nicheDescription: input.nicheDescription }),
    ...(input.language !== undefined && { language: input.language }),
    ...(input.collectionWordCount !== undefined && { collectionWordCount: input.collectionWordCount }),
    ...(input.productWordCount !== undefined && { productWordCount: input.productWordCount }),
    ...(input.customerPersona !== undefined && { customerPersona: input.customerPersona }),
  };

  const settings = await prisma.storeSettings.upsert({
    where: { storeId },
    create: { storeId, ...data },
    update: data,
  });

  return settings;
}
