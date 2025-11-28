import { IGeneration } from "../types";
import { Schema, model } from "mongoose";

const generationSchema = new Schema<IGeneration>(
  {
    productId: { type: String, required: true },
    generationId: { type: String, required: true },
    generation: { type: String, required: true },
  },
  { timestamps: true }
);

export const Generation = model<IGeneration>("Generation", generationSchema);
