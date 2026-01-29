import { Router } from "express";
import * as generationsController from "../controllers/generations.controller";
import { gatewayGuard, requireAuth } from "../middlewares/gateway-guard";

const router = Router();

// Apply gateway guard to all routes (verify requests come from gateway)
router.use(gatewayGuard);

// Apply authentication requirement to all generation routes
router.use(requireAuth);

router.get("/", generationsController.getAllGenerations);

router.get("/:id", generationsController.getGenerationById);

export default router;
