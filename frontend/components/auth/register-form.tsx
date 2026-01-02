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
import { AuthProviderButton } from "@/components/auth/auth-provider-button";
import Link from "next/link";

import { GitHubIcon } from "../icons/github-icon";
import { GoogleIcon } from "../icons/google-icon";
import { RobloxIcon } from "../icons/roblox-icon";
import { signInWithProvider } from "@/lib/auth-client";
import { getHookFormErrorMessage } from "@/utils/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  onSubmit: (values: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
};

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignInWithProvider = async (provider: string) => {
    await signInWithProvider(provider);
  };

  const submit = async (values: RegisterFormValues) => {
    try {
      await onSubmit({
        email: values.email,
        password: values.password,
        name: values.name,
      });
    } catch (err: unknown) {
      setError("root", {
        type: "server",
        message: getHookFormErrorMessage(err),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(submit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>

              {errors.root?.message && (
                <p className="text-sm text-destructive text-center">
                  {errors.root.message}
                </p>
              )}

              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder="John Doe" {...register("name")} />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
                {errors.email?.message && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                  </div>

                  <div>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword?.message && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <FieldDescription>
                  Password must be at least 8 characters.
                </FieldDescription>
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
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
