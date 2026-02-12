import { Request, Response, NextFunction } from "express";
import {
  verifyShopifyHmac,
  verifySignedState,
} from "../services/token.service";
import { completeOAuthCallback } from "../services/store.service";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function handleOAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as Record<string, string>;
    const { code, state } = query;

    // 1. Verify HMAC from Shopify
    if (!verifyShopifyHmac(query)) {
      return res.redirect(
        `${FRONTEND_URL}/dashboard?shopify_auth=error&message=${encodeURIComponent("Invalid HMAC signature")}`
      );
    }

    // 2. Verify and parse signed state
    if (!state) {
      return res.redirect(
        `${FRONTEND_URL}/dashboard?shopify_auth=error&message=${encodeURIComponent("Missing state parameter")}`
      );
    }

    const stateData = verifySignedState(state);
    if (!stateData) {
      return res.redirect(
        `${FRONTEND_URL}/dashboard?shopify_auth=error&message=${encodeURIComponent("Invalid state signature")}`
      );
    }

    // 3. Exchange code for token and update store
    const store = await completeOAuthCallback(
      stateData.storeId,
      stateData.nonce,
      code
    );

    // 4. Redirect to frontend dashboard with success
    res.redirect(
      `${FRONTEND_URL}/dashboard?shopify_auth=success&store_name=${encodeURIComponent(store.name)}`
    );
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    res.redirect(
      `${FRONTEND_URL}/dashboard?shopify_auth=error&message=${encodeURIComponent(error.message || "OAuth failed")}`
    );
  }
}
