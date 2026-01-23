import { Router } from "express";
import * as collectionsController from "../controllers/shopify-collections.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
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

export default router;
