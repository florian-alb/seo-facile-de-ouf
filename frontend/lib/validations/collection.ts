import { z } from "zod";

export const collectionFormSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis.")
    .max(255, "Le titre doit contenir moins de 255 caractères."),

  descriptionHtml: z
    .string()
    .max(65535, "La description est trop longue.")
    .optional()
    .nullable(),

  seoTitle: z.string().optional().nullable(),

  seoDescription: z.string().optional().nullable(),
});

export type CollectionFormSchema = z.infer<typeof collectionFormSchema>;
