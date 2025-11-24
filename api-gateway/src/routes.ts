import { Route } from "./types";

export const ROUTES: Route[] = [
  {
    url: "/public",
    auth: false,
    creditCheck: false,
    proxy: {
      target: "http://public-api:5050",
      changeOrigin: true,
    },
  },
  {
    url: "/private",
    auth: false,
    creditCheck: false,
    proxy: {
      target: "http://private-api:5555",
      changeOrigin: true,
    },
  },
];
