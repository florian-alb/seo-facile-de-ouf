import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
import type { ShopifyCredentials } from "@seo-facile-de-ouf/shared/src/shopify";

/**
 * Create Shopify API client for a specific shop
 * We need to create a new client per shop because each has different credentials
 */
function createShopifyClient(credentials: ShopifyCredentials) {
  return shopifyApi({
    apiKey: credentials.clientId || "custom-app",
    apiSecretKey: credentials.clientSecret || "custom-app-secret",
    scopes: ["read_products", "read_collections"],
    hostName: credentials.shopifyDomain,
    apiVersion: ApiVersion.January25,
    isEmbeddedApp: false,
    isCustomStoreApp: true,
    adminApiAccessToken: credentials.accessToken, // This is required for custom apps
  });
}

/**
 * Utility function for Shopify Admin GraphQL API calls using official SDK
 * Handles authentication, error handling, and logging
 */
export async function shopifyAdminGraphQL<T>(
  credentials: ShopifyCredentials,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  console.log("🔍 Shopify GraphQL Request (SDK):", {
    domain: credentials.shopifyDomain,
    tokenPrefix: credentials.accessToken.substring(0, 15) + "...",
    queryPreview: query.substring(0, 100) + "...",
    variables,
  });

  try {
    // Create Shopify client for this shop
    const shopify = createShopifyClient(credentials);

    // Create a session for this request
    const session = new Session({
      id: `offline_${credentials.shopifyDomain}`,
      shop: credentials.shopifyDomain,
      state: "offline",
      isOnline: false,
      accessToken: credentials.accessToken,
    });

    // Create GraphQL client
    const client = new shopify.clients.Graphql({ session });

    // Execute query
    const response = await client.request(query, { variables });

    console.log("✅ Shopify API Success (SDK)");
    return response.data as T;
  } catch (error: any) {
    console.error("❌ Shopify SDK Error:", {
      message: error.message,
      response: error.response,
      errors: error.response?.errors,
    });

    // Better error messages
    if (error.response?.errors) {
      throw new Error(
        `Shopify GraphQL errors: ${JSON.stringify(error.response.errors)}`
      );
    }

    throw error;
  }
}
