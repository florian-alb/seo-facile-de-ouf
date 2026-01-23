import express, { Application } from "express";
import cors from "cors";
import storeRouter from "./routes/store.routes";
import collectionsRouter from "./routes/shopify-collections.routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  // Configure CORS to allow credentials from frontend via API Gateway
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  // Mount routes
  app.use("/stores", storeRouter);
  app.use("/", collectionsRouter); // Handles /shops/:shopId/collections

  app.use(errorHandler);

  return app;
};

export default createApp;
