import { createAuthClient } from "better-auth/react";

export const authConfig = {
  baseURL: process.env.API_URL || "http://localhost:4000",
  frontendURL: process.env.FRONTEND_URL || "http://localhost:3000",
};

export const authClient = createAuthClient({
  baseURL: authConfig.baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export async function signInWithProvider(provider: string) {
  const callbackURL = `${authConfig.frontendURL}/dashboard`;
  return authClient.signIn.social({ provider, callbackURL });
}

export async function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  return authClient.signUp.email({ email, password, name });
}

export async function signOut() {
  return authClient.signOut();
}

export async function getSession() {
  return authClient.getSession();
}
