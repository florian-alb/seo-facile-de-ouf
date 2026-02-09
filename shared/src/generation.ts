export type GenerationFieldType =
  | "description"
  | "seoTitle"
  | "seoDescription"
  | "full_description"
  | "meta_only"
  | "slug_only";

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface GenerationContent {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface GenerationHistoryItem {
  _id: string;
  entityType: "product" | "collection";
  productId?: string;
  productName?: string;
  collectionId?: string;
  collectionName?: string;
  fieldType: GenerationFieldType;
  status: GenerationStatus;
  content?: GenerationContent;
  createdAt: string;
  completedAt?: string;
}

export interface GenerationDetail extends GenerationHistoryItem {
  keywords: string[];
  storeSettings?: {
    nicheKeyword: string;
    nicheDescription: string;
    language: string;
    productWordCount: number;
    collectionWordCount?: number;
    customerPersona: string;
  };
  productContext?: {
    title: string;
    tags: string[];
    vendor: string | null;
    productType: string | null;
    price: number;
    currentDescription: string | null;
  };
  collectionContext?: {
    title: string;
    handle: string;
    productsCount: number;
    currentDescription: string | null;
  };
  error?: string;
  userId: string;
  shopId: string;
}
