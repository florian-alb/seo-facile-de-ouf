import mongoose, { Schema, Document } from 'mongoose';
 
export interface IGeneration extends Document {
  // Infos produit
  productId: string;
  productName: string;
  keywords: string[];
  
  // État du job
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Résultat
  content?: {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
  };
  
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
 
const GenerationSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  keywords: [{ type: String }],
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  content: {
    title: String,
    description: String,
    metaTitle: String,
    metaDescription: String,
    slug: String
  },
  
  error: String,
  retryCount: { type: Number, default: 0 },
  userId: { type: String, required: true },
  shopId: { type: String, required: true },
  
  completedAt: Date
}, { 
  timestamps: true 
});
 
// Index pour les requêtes fréquentes
GenerationSchema.index({ status: 1, createdAt: -1 });
GenerationSchema.index({ userId: 1, shopId: 1 });
 
export const Generation = mongoose.model<IGeneration>(
  'Generation', 
  GenerationSchema
);
