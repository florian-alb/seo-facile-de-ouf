import { IGeneration } from "../types";
import { Schema, model } from "mongoose";

const generationSchema = new Schema<IGeneration>(
  {
    productId: { type: String, required: true },
    generationId: { type: String, required: true },
    generation: { type: String, required: true },
    userId: { type: String, required: false, index: true }, // Optional initially for backward compatibility
  },
  { timestamps: true }
);

export const Generation = model<IGeneration>("Generation", generationSchema);
