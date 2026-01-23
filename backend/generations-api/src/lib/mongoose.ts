import mongoose from "mongoose";
import { connectRabbitMQ } from "./rabbitmq";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    await connectRabbitMQ();

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export { mongoose };
