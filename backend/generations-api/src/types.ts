import { Document } from "mongoose";

export interface IGeneration extends Document {
  productId: string;
  generationId: string;
  generation: string;
}

export interface IError {
  status: number;
  message: string;
  url: string;
}
