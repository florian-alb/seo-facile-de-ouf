import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "./types.js";

export const setupProxies = (app: Application, routes: Route[]): void => {
  routes.forEach((route) => {
    // Use the context overload so `pathRewrite` rules from `routes.ts`
    // (e.g. { '^/users': '' }) are applied against the original request
    // path. This prevents duplicating the prefix (which caused `/users`
    // to become `/users/users` on the target and be interpreted as an id).
    const proxyOptions = { ...route.proxy } as any;

    // Debug log: show the actual options passed to http-proxy-middleware
    console.log(`[api-gateway] setup proxy for ${route.url}:`, JSON.stringify(proxyOptions));

    if (!proxyOptions || !proxyOptions.target) {
      const routeInfo = `proxy=${JSON.stringify(route.proxy ?? {})}`;
      throw new Error(
        `[api-gateway] Missing "target" for proxy route "${route.url}". Check ROUTES configuration and environment variables. ${routeInfo}`
      );
    }

    // Use explicit app.use(path, middleware) overload to avoid
    // ambiguities with the factory overload. This ensures the
    // `proxyOptions` object (including `target`) is passed as
    // the options argument to `createProxyMiddleware`.
    app.use(route.url, createProxyMiddleware(proxyOptions));
  });
};
