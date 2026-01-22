import { Router } from "express";
import * as collectionsController from "../controllers/shopify-collections.controller";

const router = Router();

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
