import { Route } from "../types";

export const ROUTES: Route[] = [
  // Better Auth routes - must be first to avoid conflicts
  {
    url: "/api/auth",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: (path: string) => {
        return `/api/auth${path}`;
      },
    },
  },
  // Plain auth routes (for routes like /auth/me)
  {
    url: "/auth",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: { "^/auth": "" }, // Ensure path is rewritten correctly
    },
  },
  // Stores routes
  {
    url: "/stores",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: { "^/stores": "/stores" },
    },
  },
  // User routes
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
  // Generation routes
  {
    url: "/generations",
    auth: false,
    creditCheck: false,
    proxy: {
      target: process.env.GENERATIONS_API_URL || "http://localhost:5002",
      changeOrigin: true,
      pathRewrite: { "^/generations": "" },
    },
  },
];
