import { Request, Response, NextFunction } from "express";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import { prisma } from "../lib/prisma";
import { decrypt, encrypt } from "../lib/encryption";

// Temporary storage for OAuth state (state -> storeId mapping)
// In production, use Redis or a proper session store
const oauthStates = new Map<string, { storeId: string; expiresAt: number }>();

/**
 * Start OAuth flow
 * GET /api/shopify/oauth/auth?storeId=xxx
 *
 * The store MUST already exist in DB with clientId/clientSecret
 */
export async function startOAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const storeId = req.query.storeId as string;

    if (!storeId) {
      return res.status(400).json({ error: "Missing storeId parameter" });
    }

    // Get store from DB (contains API credentials)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Decrypt credentials
    const apiKey = decrypt(store.encryptedClientId);
    const apiSecret = decrypt(store.encryptedClientSecret);

    console.log("🚀 Starting OAuth for store:", storeId, "shop:", store.shopifyDomain);

    // Create Shopify OAuth client with user's app credentials
    const shopify = shopifyApi({
      apiKey,
      apiSecretKey: apiSecret,
      scopes: ["read_products", "read_collections", "write_products", "write_collections"],
      hostName: process.env.SHOPIFY_HOST_NAME || "localhost:5001",
      apiVersion: ApiVersion.January26,
      isEmbeddedApp: false,
    });

    // Generate random state for security
    const state = Math.random().toString(36).substring(7);

    // Store state for callback
    oauthStates.set(state, {
      storeId,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Sanitize shop domain
    const sanitizedShop = shopify.utils.sanitizeShop(store.shopifyDomain, true)!;

    // Generate OAuth URL
    const authUrl = await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: "/shopify/oauth/callback", // Via API Gateway
      isOnline: false, // Offline token = permanent
      rawRequest: req,
      rawResponse: res,
    });

    console.log("📍 OAuth URL generated:", authUrl);

    // Return URL for frontend to redirect
    res.json({ authUrl, state });
  } catch (err) {
    console.error("❌ OAuth start error:", err);
    next(err);
  }
}

/**
 * Handle OAuth callback
 * GET /api/shopify/oauth/callback?code=xxx&shop=xxx&state=xxx
 */
export async function handleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const shop = req.query.shop as string;
    const state = req.query.state as string;

    if (!shop) {
      return res.status(400).json({ error: "Missing shop in callback" });
    }

    // Get OAuth state
    const oauthState = oauthStates.get(state);
    if (!oauthState || oauthState.expiresAt < Date.now()) {
      oauthStates.delete(state);
      return res.status(400).json({ error: "OAuth state expired or invalid" });
    }

    // Get store from DB
    const store = await prisma.store.findUnique({
      where: { id: oauthState.storeId },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Decrypt credentials to create Shopify client
    const apiKey = decrypt(store.encryptedClientId);
    const apiSecret = decrypt(store.encryptedClientSecret);

    const shopify = shopifyApi({
      apiKey,
      apiSecretKey: apiSecret,
      scopes: ["read_products", "read_collections", "write_products", "write_collections"],
      hostName: process.env.SHOPIFY_HOST_NAME || "localhost:5001",
      apiVersion: ApiVersion.January26,
      isEmbeddedApp: false,
    });

    console.log("🔄 Processing OAuth callback for:", shop);

    // Complete OAuth
    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log("✅ OAuth success! Access token received");

    // Update store with access token
    await prisma.store.update({
      where: { id: oauthState.storeId },
      data: {
        encryptedAccessToken: encrypt(session.accessToken!),
      },
    });

    oauthStates.delete(state); // Clean up

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/dashboard?shopify_auth=success&store_id=${oauthState.storeId}&store_name=${encodeURIComponent(store.name)}`
    );
  } catch (err: any) {
    console.error("❌ OAuth callback error:", err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/dashboard?shopify_auth=error&message=${encodeURIComponent(err.message)}`
    );
  }
}
