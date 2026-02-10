import generationRouter from "./routes/generation.routes";
import { createApp } from "@seo-facile-de-ouf/backend-shared";

export default () =>
  createApp({
    routes: [{ path: "/", router: generationRouter }],
  });
