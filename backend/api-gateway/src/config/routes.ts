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
  // User routes
  {
    url: "/users",
    auth: true,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: { "^/users": "" },
    },
  },
  // Store routes (scoped to the authenticated user)
  {
    url: "/stores",
    auth: true,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      // Express strips the mount path (/stores) before proxying (so "/" would hit users router).
      // Re-add it so users-api receives "/stores/..." and matches storeRouter.
      pathRewrite: (path: string) => `/stores${path}`,
    },
  },
  // Shopify collections routes
  {
    url: "/shops",
    auth: true,
    creditCheck: false,
    proxy: {
      target: process.env.USERS_API_URL || "http://localhost:5001",
      changeOrigin: true,
      pathRewrite: (path: string) => `/shops${path}`,
    },
  },
  // Generation routes
  {
    url: "/generations",
    auth: true,
    creditCheck: false,
    proxy: {
      target: process.env.GENERATIONS_API_URL || "http://localhost:5002",
      changeOrigin: true,
      pathRewrite: { "^/generations": "" },
    },
  },
];
