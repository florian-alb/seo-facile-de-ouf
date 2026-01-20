import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import storeRouter from "./routes/store.routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  // Configure CORS to allow credentials from frontend
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  app.use("/auth", authRouter);
  app.use("/stores", storeRouter);
  app.use("/", userRouter);

  app.use(errorHandler);

  return app;
};

export default createApp;
