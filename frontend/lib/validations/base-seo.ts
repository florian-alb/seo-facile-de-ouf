import { z } from "zod";

export const baseSeoFields = {
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
};
