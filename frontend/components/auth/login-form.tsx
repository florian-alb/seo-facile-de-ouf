"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { GitHubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { RobloxIcon } from "@/components/icons/roblox-icon";
import { AuthProviderButton } from "@/components/auth/auth-provider-button";

import { signInWithProvider } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignInWithProvider = async (provider: string) => {
    await signInWithProvider(provider);
  };

  const submit = async (values: LoginFormValues) => {
    try {
      await onSubmit({
        email: values.email,
        password: values.password,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError("root", { type: "server", message });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(submit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to login
                </p>
              </div>

              {errors.root?.message && (
                <p className="text-sm text-destructive text-center">
                  {errors.root.message}
                </p>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email?.message && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password?.message && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                {/* Important: AuthProviderButton should render a <button type="button"> */}
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
                Don&apos;t have an account?{" "}
                <Link href="/auth/register">Create one</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
