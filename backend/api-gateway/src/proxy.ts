import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "./types.js";

export const setupProxies = (app: Application, routes: Route[]): void => {
  routes.forEach((route) => {
    app.use(route.url, createProxyMiddleware(route.proxy));
  });
};
