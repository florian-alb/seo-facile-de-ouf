export type ShopifyStoreLanguage = "fr" | "en" | "es" | "de" | "it";

export type ShopifyStore = {
  id: string;
  name: string;
  url: string;
  shopifyDomain: string;
  language: ShopifyStoreLanguage;
  clientId: string;
  clientSecret: string;
  createdAt: string;
  updatedAt: string;
};

export type ShopifyStoreFormValues = Omit<
  ShopifyStore,
  "id" | "createdAt" | "updatedAt"
>;

export const LANGUAGE_OPTIONS: {
  value: ShopifyStoreLanguage;
  label: string;
}[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
];
