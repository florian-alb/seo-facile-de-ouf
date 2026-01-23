export type ShopifyStoreLanguage = "fr" | "en" | "es" | "de" | "it";

// API response type (credentials are not returned by the API)
export type ShopifyStore = {
  id: string;
  userId: string;
  name: string;
  url: string;
  shopifyDomain: string;
  language: ShopifyStoreLanguage;
  status: "pending" | "connected" | "error";
  createdAt: string;
  updatedAt: string;
};

// Form values for creating/updating stores
export type ShopifyStoreFormValues = {
  name: string;
  url: string;
  shopifyDomain: string;
  language: ShopifyStoreLanguage;
  clientId: string;
  clientSecret: string;
};

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
