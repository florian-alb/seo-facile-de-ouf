import storeRouter from "./routes/store.routes";
import storeSettingsRouter from "./routes/store-settings.routes";
import collectionsRouter from "./routes/shopify-collections.routes";
import productsRouter from "./routes/shopify-products.routes";
import { createApp } from "@seo-facile-de-ouf/backend-shared";

export default () =>
  createApp({
    routes: [
      { path: "/stores", router: storeRouter },
      { path: "/stores", router: storeSettingsRouter },
      { path: "/", router: collectionsRouter },
      { path: "/", router: productsRouter },
    ],
  });
