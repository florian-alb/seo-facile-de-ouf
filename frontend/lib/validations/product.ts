import { z } from "zod";

export const productFormSchema = z.object({
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

  tags: z.array(z.string()),

  imageAlt: z
    .string()
    .max(512, "Le texte alternatif est trop long.")
    .optional()
    .nullable(),

  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"], {
    message: "Veuillez sélectionner un statut valide.",
  }),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
