import { z } from "zod";

export const storeSettingsSchema = z.object({
  nicheKeyword: z
    .string()
    .max(200, "Le mot clé ne doit pas dépasser 200 caractères.")
    .optional()
    .or(z.literal("")),

  nicheDescription: z
    .string()
    .max(2000, "La description ne doit pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("")),

  language: z.enum(["fr", "en", "es", "de", "it"]).optional(),

  collectionWordCount: z
    .number()
    .min(600, "Minimum 600 mots.")
    .max(1200, "Maximum 1200 mots.")
    .optional(),

  productWordCount: z
    .number()
    .min(200, "Minimum 200 mots.")
    .max(600, "Maximum 600 mots.")
    .optional(),

  customerPersona: z
    .string()
    .max(2000, "Le persona ne doit pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("")),
});

export type StoreSettingsFormSchema = z.infer<typeof storeSettingsSchema>;
