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
      // Preserve the full path /api/auth for Better Auth
      // Express removes /api/auth prefix, so we need to add it back
      pathRewrite: (path: string) => {
        // path will be like "/ok" after Express removes "/api/auth"
        // We need to add "/api/auth" back
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
