export interface StoreSettings {
  id: string;
  storeId: string;
  nicheKeyword: string;
  nicheDescription: string;
  language: string;
  collectionWordCount: number;
  productWordCount: number;
  customerPersona: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettingsInput {
  nicheKeyword: string;
  nicheDescription: string;
  language: string;
  collectionWordCount: number;
  productWordCount: number;
  customerPersona: string;
}
