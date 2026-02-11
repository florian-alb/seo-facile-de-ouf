import { z } from "zod";
import { baseSeoFields } from "./base-seo";

export const collectionFormSchema = z.object({
  ...baseSeoFields,
});

export type CollectionFormSchema = z.infer<typeof collectionFormSchema>;
