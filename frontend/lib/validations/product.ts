import { z } from "zod";
import { baseSeoFields } from "./base-seo";

export const productFormSchema = z.object({
  ...baseSeoFields,

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
