import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "../types";

export const setupProxies = (app: Application, routes: Route[]): void => {
  routes.forEach((route) => {
    // Use the context overload so `pathRewrite` rules from `routes.ts`
    // (e.g. { '^/users': '' }) are applied against the original request
    // path. This prevents duplicating the prefix (which caused `/users`
    // to become `/users/users` on the target and be interpreted as an id).
    const proxyOptions = {
      ...route.proxy,
            // Preserve CORS headers
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        // Allow CORS headers to pass through
        if (req.headers.origin) {
          res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
        }
      },
    } as any;

    // Debug log: show the actual options passed to http-proxy-middleware
    console.log(
      `[api-gateway] setup proxy for ${route.url}:`,
      JSON.stringify(proxyOptions)
    );

    if (!proxyOptions || !proxyOptions.target) {
      const routeInfo = `proxy=${JSON.stringify(route.proxy ?? {})}`;
      throw new Error(
        `[api-gateway] Missing "target" for proxy route "${route.url}". Check ROUTES configuration and environment variables. ${routeInfo}`
      );
    }

    // http-proxy-middleware@3: mount by path and pass options separately.
    // Note: Express will strip the mount path from `req.url`. For routes that
    // need the prefix on the target service (e.g. /stores), handle it via
    // route-specific `pathRewrite` (see routes.ts).
    app.use(route.url, createProxyMiddleware(proxyOptions));
  });
};
