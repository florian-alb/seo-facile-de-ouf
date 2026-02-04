import { Router } from "express";
import * as collectionsController from "../controllers/shopify-collections.controller";
import { gatewayGuard, requireAuth } from "../middlewares/gateway-guard";

const router = Router();

// Apply gateway guard to all routes (verify requests come from gateway)
router.use(gatewayGuard);

// Apply authentication requirement to all collection routes
router.use(requireAuth);

router.get("/shops/:shopId/collections", collectionsController.getCollections);
router.post(
  "/shops/:shopId/collections/sync",
  collectionsController.syncCollections
);
router.get(
  "/shops/:shopId/collections/:collectionId",
  collectionsController.getCollectionById
);
router.patch(
  "/shops/:shopId/collections/:collectionId",
  collectionsController.updateCollection
);
router.post(
  "/shops/:shopId/collections/:collectionId/publish",
  collectionsController.publishCollection
);

export default router;
