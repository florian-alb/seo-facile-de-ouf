import { Router } from "express";
import * as storesController from "../controllers/stores.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", storesController.getAllStores);
router.get("/:id", storesController.getStoreById);
router.post("/", storesController.createStore);
router.put("/:id", storesController.updateStore);
router.delete("/:id", storesController.deleteStore);

export default router;
