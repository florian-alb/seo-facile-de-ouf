import express, { Application, Request, Response } from "express";
import cors from "cors";
import { setupProxies } from "./config/proxy";
import { ROUTES } from "./config/routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  // Configure CORS to allow frontend requests
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://frontend:3000",
        process.env.FRONTEND_URL || "",
      ].filter(Boolean),
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Log resolved routes so we can verify environment variables and targets
  console.log("API Gateway ROUTES:", JSON.stringify(ROUTES, null, 2));

  // Setup proxies first (specific routes)
  // DON'T parse body before proxying - let backend services handle it
  setupProxies(app, ROUTES);

  // Health check route (after proxies, so it doesn't conflict)
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      message: "API Gateway",
      routes: ROUTES.map((r) => r.url),
    });
  });

  // Error handler must be last
  app.use(errorHandler);

  return app;
};

export default createApp;
