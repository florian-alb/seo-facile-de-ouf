import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import { createApp } from "@seo-facile-de-ouf/backend-shared";

export default () =>
  createApp({
    beforeRoutes: (app) => {
      app.all("/api/auth/*splat", toNodeHandler(auth));
    },
    routes: [
      { path: "/auth", router: authRouter },
      { path: "/", router: userRouter },
    ],
  });
