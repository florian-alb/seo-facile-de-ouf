import mongoose, { Schema, Document } from "mongoose";

export type FieldType = "description" | "seoTitle" | "seoDescription" | "full_description" | "meta_only" | "slug_only";

export interface IStoreSettings {
  nicheKeyword: string;
  nicheDescription: string;
  language: string;
  productWordCount: number;
  collectionWordCount?: number;
  customerPersona: string;
}

export interface IProductContext {
  title: string;
  tags: string[];
  vendor: string | null;
  productType: string | null;
  price: number;
  currentDescription: string | null;
}

export interface ICollectionContext {
  title: string;
  handle: string;
  productsCount: number;
  currentDescription: string | null;
}

export interface IGeneration extends Document {
  // Type d'entite
  entityType: "product" | "collection";

  // Infos produit (optionnel si collection)
  productId?: string;
  productName?: string;

  // Infos collection (optionnel si produit)
  collectionId?: string;
  collectionName?: string;

  keywords: string[];

  // Type de champ a generer
  fieldType: FieldType;

  // État du job
  status: "pending" | "processing" | "completed" | "failed";

  // Résultat
  content?: {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
  };

  // Contexte pour le prompt IA
  storeSettings?: IStoreSettings;
  productContext?: IProductContext;
  collectionContext?: ICollectionContext;

  // Métadonnées
  error?: string;
  retryCount: number;
  userId: string;
  shopId: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const GenerationSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["product", "collection"],
      default: "product",
    },
    productId: { type: String },
    productName: { type: String },
    collectionId: { type: String },
    collectionName: { type: String },
    keywords: [{ type: String }],

    fieldType: {
      type: String,
      enum: ["description", "seoTitle", "seoDescription", "full_description", "meta_only", "slug_only"],
      default: "full_description",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    content: {
      title: String,
      description: String,
      metaTitle: String,
      metaDescription: String,
      slug: String,
    },

    storeSettings: {
      nicheKeyword: String,
      nicheDescription: String,
      language: String,
      productWordCount: Number,
      collectionWordCount: Number,
      customerPersona: String,
    },

    productContext: {
      title: String,
      tags: [String],
      vendor: String,
      productType: String,
      price: Number,
      currentDescription: String,
    },

    collectionContext: {
      title: String,
      handle: String,
      productsCount: Number,
      currentDescription: String,
    },

    error: String,
    retryCount: { type: Number, default: 0 },
    userId: { type: String, required: true },
    shopId: { type: String, required: true },

    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Index pour les requêtes fréquentes
GenerationSchema.index({ status: 1, createdAt: -1 });
GenerationSchema.index({ userId: 1, shopId: 1 });

export const Generation = mongoose.model<IGeneration>(
  "Generation",
  GenerationSchema,
);
