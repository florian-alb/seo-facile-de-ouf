/**
 * Shopify GraphQL Service
 * Simple fetch-based implementation for calling Shopify Admin API
 */

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Execute a GraphQL query against Shopify Admin API
 * @param shopifyDomain - The Shopify store domain (e.g., "myshop.myshopify.com")
 * @param accessToken - Shopify access token
 * @param query - GraphQL query string
 * @param variables - Optional variables for the query
 */
export async function shopifyAdminGraphQL<T>(
  shopifyDomain: string,
  accessToken: string,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const url = `https://${shopifyDomain}/admin/api/2026-01/graphql.json`;

  const body: GraphQLRequest = {
    query,
    ...(variables && { variables }),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Shopify API request failed (${response.status}): ${errorText}`
      );
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(
        `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
      );
    }

    if (!result.data) {
      throw new Error("No data returned from GraphQL query");
    }

    return result.data;
  } catch (error: any) {
    console.error("❌ Shopify GraphQL Error:", {
      domain: shopifyDomain,
      error: error.message,
    });
    throw error;
  }
}
