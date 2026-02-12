import { Router } from "express";
import * as shopifyAuthController from "../controllers/shopify-auth.controller";
import { gatewayGuard } from "@seo-facile-de-ouf/backend-shared";

const router = Router();

// Gateway guard only — no requireAuth (these routes are public via gateway)
router.use(gatewayGuard);

// GET /shopify/auth/callback — Shopify redirects here after merchant approves
router.get("/callback", shopifyAuthController.handleOAuthCallback);

export default router;
