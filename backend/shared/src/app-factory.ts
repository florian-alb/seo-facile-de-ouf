import express, { Application, Router } from "express";
import cors from "cors";
import { errorHandler } from "./error.middleware";

interface AppOptions {
  routes: Array<{ path: string; router: Router }>;
  beforeRoutes?: (app: Application) => void;
}

export function createApp(options: AppOptions): Application {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  if (options.beforeRoutes) {
    options.beforeRoutes(app);
  }

  app.use(express.json());

  for (const { path, router } of options.routes) {
    app.use(path, router);
  }

  app.use(errorHandler);

  return app;
}
