/**
 * Token Service
 * Handles Shopify OAuth2 client credentials token exchange
 */

interface TokenResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  associated_user_scope: string;
  associated_user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    account_owner: boolean;
    locale: string;
    collaborator: boolean;
  };
}

/**
 * Exchange client credentials for an access token
 * @param shopifyDomain - The Shopify domain (e.g., "myshop.myshopify.com")
 * @param clientId - Shopify API client ID
 * @param clientSecret - Shopify API client secret
 * @returns Access token and expiration date
 */
export async function exchangeTokenWithShopify(
  shopifyDomain: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const url = `https://${shopifyDomain}/admin/oauth/access_token`;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Shopify token exchange failed (${response.status}): ${errorText}`
      );
    }

    const data: TokenResponse = await response.json();

    // Calculate expiration (default 24h if not provided)
    const expiresInSeconds = data.expires_in || 86400; // 24 hours
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      accessToken: data.access_token,
      expiresAt,
    };
  } catch (error: any) {
    console.error("Token exchange error:", error);
    throw new Error(`Failed to exchange credentials: ${error.message}`);
  }
}

/**
 * Check if a token is expired or will expire soon (within 5 minutes)
 * @param expiresAt - Token expiration date
 * @returns True if token needs refresh
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return expiresAt <= fiveMinutesFromNow;
}
