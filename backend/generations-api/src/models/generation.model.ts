import mongoose, { Schema, Document } from "mongoose";

export type FieldType = "description" | "seoTitle" | "seoDescription" | "full_description" | "meta_only" | "slug_only";

export interface IStoreSettings {
  nicheKeyword: string;
  nicheDescription: string;
  language: string;
  productWordCount: number;
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

export interface IGeneration extends Document {
  // Infos produit
  productId: string;
  productName: string;
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
    productId: { type: String, required: true },
    productName: { type: String, required: true },
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
