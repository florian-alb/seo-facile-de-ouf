import { Application, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "../types";
import {
  validateSession,
  requireAuthentication,
  AuthenticatedRequest,
} from "../middlewares/auth.middleware";

export const setupProxies = (app: Application, routes: Route[]): void => {
  routes.forEach((route) => {
    // Build proxy options with header injection
    const proxyOptions = {
      ...route.proxy,
      // Inject gateway secret and user info into proxied requests
      on: {
        proxyReq: (proxyReq: any, req: AuthenticatedRequest) => {
          // Always inject the gateway secret (read at runtime, not import time)
          const gatewaySecret = process.env.GATEWAY_SECRET;
          if (gatewaySecret) {
            proxyReq.setHeader("X-Gateway-Secret", gatewaySecret);
          }

          // Inject user info if authenticated
          if (req.user) {
            proxyReq.setHeader("X-User-ID", req.user.id);
            proxyReq.setHeader("X-User-Email", req.user.email);
            if (req.user.name) {
              proxyReq.setHeader("X-User-Name", req.user.name);
            }
          }
        },
        proxyRes: (proxyRes: any, req: any, res: any) => {
          // Preserve CORS headers
          if (req.headers.origin) {
            res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
          }
        },
        error: (err: Error, req: Request, res: Response) => {
          console.error("[Gateway] Proxy error:", err);
          res.status(502).json({ error: "Service unavailable" });
        },
      },
    } as any;

    // Debug log: show the actual options passed to http-proxy-middleware
    console.log(
      `[api-gateway] setup proxy for ${route.url}:`,
      JSON.stringify({ ...proxyOptions, on: "[handlers]" })
    );

    if (!proxyOptions || !proxyOptions.target) {
      const routeInfo = `proxy=${JSON.stringify(route.proxy ?? {})}`;
      throw new Error(
        `[api-gateway] Missing "target" for proxy route "${route.url}". Check ROUTES configuration and environment variables. ${routeInfo}`
      );
    }

    // Build middleware chain based on route.auth flag
    const middlewares: any[] = [];

    if (route.auth) {
      // Routes requiring auth: validate session, then require authentication
      middlewares.push(validateSession);
      middlewares.push(requireAuthentication);
    }
    // Public routes: no session validation needed (e.g., /api/auth/* for Better Auth)

    // Add the proxy middleware at the end
    middlewares.push(createProxyMiddleware(proxyOptions));

    // Mount all middlewares for this route
    app.use(route.url, ...middlewares);
  });
};
