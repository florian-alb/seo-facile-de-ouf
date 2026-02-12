import { z } from "zod";

export const shopifyStoreSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom doit contenir moins de 100 caractères."),

  url: z
    .string()
    .url("Veuillez entrer une URL valide.")
    .refine((url) => url.startsWith("https://"), "L'URL doit commencer par https://"),

  shopifyDomain: z
    .string()
    .min(1, "Le domaine Shopify est requis.")
    .regex(
      /^[a-zA-Z0-9-]+\.myshopify\.com$/,
      "Le domaine doit être au format: boutique.myshopify.com"
    ),

  language: z.enum(["fr", "en", "es", "de", "it"], {
    message: "Veuillez sélectionner une langue.",
  }),
});

export type ShopifyStoreFormSchema = z.infer<typeof shopifyStoreSchema>;
