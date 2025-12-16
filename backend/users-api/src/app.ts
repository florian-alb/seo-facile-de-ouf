import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  app.use(cors());

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  app.use("/auth", authRouter);
  app.use("/", userRouter); 

  app.use(errorHandler);

  return app;
};

export default createApp;
