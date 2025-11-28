import { Route } from "./types";

export const ROUTES: Route[] = [
  {
    url: "/generation",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.GENERATIONS_API_URL || "http://localhost:5002",
      changeOrigin: true,
      pathRewrite: { "^/generation": "" },
    },
  },
  {
    url: "/users",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: { "^/users": "" },
    },
  },
  {
    url: "/mongo-express",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.MONGO_EXPRESS_URL || "http://localhost:8081",
      changeOrigin: true,
    },
  }
];
