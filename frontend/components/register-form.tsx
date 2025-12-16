"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { GitHubIcon } from "./icons/github-icon";
import { GoogleIcon } from "./icons/google-icon";
import { RobloxIcon } from "./icons/roblox-icon";
import { AuthProviderButton } from "./auth-provider-button";
import { signInWithProvider } from "@/lib/auth-client";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const handleSignInWithProvider = async (provider: string) => {
    await signInWithProvider(provider);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <AuthProviderButton
                  icon={<GitHubIcon />}
                  name="GitHub"
                  phrase="Sign in with GitHub"
                  onClick={() => handleSignInWithProvider("github")}
                />
                <AuthProviderButton
                  icon={<GoogleIcon />}
                  name="Google"
                  phrase="Sign in with Google"
                  onClick={() => handleSignInWithProvider("google")}
                />
                <AuthProviderButton
                  icon={<RobloxIcon />}
                  name="Roblox"
                  phrase="Sign in with Roblox"
                  onClick={() => handleSignInWithProvider("roblox")}
                />
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/auth/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
