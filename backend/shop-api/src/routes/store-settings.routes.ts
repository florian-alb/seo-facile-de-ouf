import { Router } from "express";
import * as storeSettingsController from "../controllers/store-settings.controller";
import { gatewayGuard, requireAuth } from "../middlewares/gateway-guard";

const router = Router();

router.use(gatewayGuard);
router.use(requireAuth);

router.get("/:storeId/settings", storeSettingsController.getSettings);
router.put("/:storeId/settings", storeSettingsController.updateSettings);

export default router;
