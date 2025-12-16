/**
 * Better Auth client configuration
 *
 * This file configures the Better Auth client for use in the frontend.
 * Make sure to install better-auth: pnpm add better-auth
 */

// Uncomment when better-auth is installed:
// import { createAuthClient } from "better-auth/react";

// For now, we'll use a placeholder that works with the API directly
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  basePath: "/api/auth",
};

/**
 * Better Auth client instance
 * Uncomment and configure when better-auth is installed:
 */
// export const authClient = createAuthClient({
//   baseURL: authConfig.baseURL,
//   basePath: authConfig.basePath,
// });

/**
 * Helper function to sign in with a social provider
 * This works with the Better Auth API directly
 */
export async function signInWithProvider(provider: string) {
  const response = await fetch(
    `${authConfig.baseURL}${authConfig.basePath}/${provider}`,
    {
      method: "GET",
      credentials: "include",
      redirect: "follow",
    }
  );

  if (response.redirected) {
    window.location.href = response.url;
  } else {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to sign in");
    }
    return data;
  }
}

/**
 * Helper function to sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const response = await fetch(`${authConfig.baseURL}/users/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign in");
  }

  return response.json();
}

/**
 * Helper function to sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const response = await fetch(`${authConfig.baseURL}/users/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign up");
  }

  return response.json();
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const response = await fetch(`${authConfig.baseURL}/users/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign out");
  }

  return response.json();
}

/**
 * Helper function to get current session
 */
export async function getSession() {
  const response = await fetch(`${authConfig.baseURL}/users/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to get session");
  }

  return response.json();
}
