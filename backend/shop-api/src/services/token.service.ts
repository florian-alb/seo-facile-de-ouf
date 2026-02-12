/**
 * Token Service
 * Handles Shopify OAuth Authorization Code Grant
 */

import crypto from "crypto";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;
const SHOPIFY_SCOPES =
  process.env.SHOPIFY_SCOPES || "read_products,write_products,read_customers";

/**
 * Build the Shopify OAuth authorize URL
 */
export function buildAuthorizeUrl(
  shopifyDomain: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    scope: SHOPIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shopifyDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for an offline access token
 * Offline tokens are permanent and do not expire
 */
export async function exchangeCodeForToken(
  shopifyDomain: string,
  code: string
): Promise<string> {
  const url = `https://${shopifyDomain}/admin/oauth/access_token`;

  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    client_secret: SHOPIFY_CLIENT_SECRET,
    code,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Shopify token exchange failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Build a signed state parameter: base64url({storeId, nonce}).hmac
 * Used to pass storeId through the OAuth redirect securely
 */
export function buildSignedState(storeId: string, nonce: string): string {
  const payload = Buffer.from(JSON.stringify({ storeId, nonce })).toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", process.env.ENCRYPTION_KEY!)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

/**
 * Verify and parse a signed state parameter
 * Returns null if signature is invalid
 */
export function verifySignedState(
  state: string
): { storeId: string; nonce: string } | null {
  const parts = state.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.ENCRYPTION_KEY!)
    .update(payload)
    .digest("hex");

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

/**
 * Verify Shopify callback HMAC
 * Shopify signs callback query params with the app secret
 */
export function verifyShopifyHmac(query: Record<string, string>): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;

  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("&");

  const computedHmac = crypto
    .createHmac("sha256", SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(computedHmac, "hex")
    );
  } catch {
    return false;
  }
}
