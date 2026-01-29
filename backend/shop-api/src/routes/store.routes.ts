import { Router } from "express";
import * as storesController from "../controllers/stores.controller";
import { gatewayGuard, requireAuth } from "../middlewares/gateway-guard";

const router = Router();

// Apply gateway guard to all routes (verify requests come from gateway)
router.use(gatewayGuard);

// Apply authentication requirement to all store routes
router.use(requireAuth);

router.get("/", storesController.getAllStores);
router.get("/:id", storesController.getStoreById);
router.post("/", storesController.createStore);
router.put("/:id", storesController.updateStore);
router.delete("/:id", storesController.deleteStore);

export default router;
