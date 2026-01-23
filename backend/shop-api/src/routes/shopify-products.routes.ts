import { Router } from "express";
import * as productsController from "../controllers/shopify-products.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

router.get("/shops/:shopId/products", productsController.getProducts);
router.post("/shops/:shopId/products/sync", productsController.syncProducts);
router.get(
  "/shops/:shopId/products/:productId",
  productsController.getProductById
);

export default router;
