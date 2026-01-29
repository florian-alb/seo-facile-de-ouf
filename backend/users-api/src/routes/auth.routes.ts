import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { gatewayGuard } from "../middlewares/gateway-guard";

const router = Router();

// Session validation endpoint for API Gateway (protected by gateway secret)
router.get("/validate-session", gatewayGuard, authController.validateSession);

// Public auth endpoints (no gateway guard - direct access allowed for Better Auth)
router.get("/me", authController.getMe);
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

export default router;
