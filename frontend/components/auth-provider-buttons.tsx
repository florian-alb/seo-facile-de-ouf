"use client";

import { AuthProviderButton } from "./auth-provider-button";
import { signInWithProvider } from "@/lib/auth-client";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      fill="currentColor"
    />
  </svg>
);

const RobloxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 56 56"
  >
    <path
      fill="currentcolor"
      d="M11.676 0 0 44.166 43.577 56l11.676-44.166zm20.409 35.827-12.177-3.308 3.264-12.342 12.182 3.308z"
    />
  </svg>
);

export function GitHubAuthButton({
  phrase = "Sign in with GitHub",
  ...props
}: Omit<
  React.ComponentProps<typeof AuthProviderButton>,
  "icon" | "name" | "onClick"
>) {
  return (
    <AuthProviderButton
      icon={<GitHubIcon />}
      name="GitHub"
      phrase={phrase}
      onClick={() => signInWithProvider("github")}
      {...props}
    />
  );
}

export function GoogleAuthButton({
  phrase = "Sign in with Google",
  ...props
}: Omit<
  React.ComponentProps<typeof AuthProviderButton>,
  "icon" | "name" | "onClick"
>) {
  return (
    <AuthProviderButton
      icon={<GoogleIcon />}
      name="Google"
      phrase={phrase}
      onClick={() => signInWithProvider("google")}
      {...props}
    />
  );
}

export function RobloxAuthButton({
  phrase = "Sign in with Roblox",
  ...props
}: Omit<
  React.ComponentProps<typeof AuthProviderButton>,
  "icon" | "name" | "onClick"
>) {
  return (
    <AuthProviderButton
      icon={<RobloxIcon />}
      name="Roblox"
      phrase={phrase}
      onClick={() => signInWithProvider("roblox")}
      {...props}
    />
  );
}

export function CustomAuthButton({
  icon,
  name,
  phrase,
  onClick,
  ...props
}: React.ComponentProps<typeof AuthProviderButton>) {
  return (
    <AuthProviderButton
      icon={icon}
      name={name}
      phrase={phrase}
      onClick={onClick}
      {...props}
    />
  );
}
