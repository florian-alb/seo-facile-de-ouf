import mongoose from "mongoose";
import { MONGO_URI } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // the microservice is stopped if the DB does not start
  }
}
