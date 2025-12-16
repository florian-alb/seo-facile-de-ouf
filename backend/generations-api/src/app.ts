import express, { Application } from "express";
import cors from "cors";
import generationRouter from "./routes/generation.routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  app.use("/", generationRouter);

  app.use(errorHandler);

  return app;
};

export default createApp;
