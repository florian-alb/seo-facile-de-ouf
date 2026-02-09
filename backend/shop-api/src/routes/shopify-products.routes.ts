import { Router } from "express";
import * as productsController from "../controllers/shopify-products.controller";
import { gatewayGuard, requireAuth } from "../middlewares/gateway-guard";

const router = Router();

// Apply gateway guard to all routes (verify requests come from gateway)
router.use(gatewayGuard);

// Apply authentication requirement to all product routes
router.use(requireAuth);

router.get("/shops/:shopId/products", productsController.getProducts);
router.post("/shops/:shopId/products/sync", productsController.syncProducts);
router.get(
  "/shops/:shopId/products/:productId",
  productsController.getProductById
);
router.patch(
  "/shops/:shopId/products/:productId",
  productsController.updateProduct
);
router.post(
  "/shops/:shopId/products/:productId/sync",
  productsController.syncSingleProduct
);
router.post(
  "/shops/:shopId/products/:productId/publish",
  productsController.publishProduct
);

export default router;
