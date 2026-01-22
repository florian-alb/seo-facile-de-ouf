import { Router } from "express";
import * as oauthController from "../controllers/shopify-oauth.controller";

const router = Router();

/**
 * OAuth flow routes
 * These handle the Shopify OAuth installation process
 */

// Start OAuth flow - requires storeId query param
router.get("/auth", oauthController.startOAuth);

// OAuth callback (Shopify redirects here after authorization)
router.get("/callback", oauthController.handleCallback);

export default router;
