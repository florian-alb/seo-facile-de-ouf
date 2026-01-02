"use client";

import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth-client";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  const router = useRouter();

  async function handleSubmit(values: { email: string; password: string }) {
    await signInWithEmail(values.email, values.password);
    router.push("/dashboard");
  }

  return <LoginForm onSubmit={handleSubmit} />;
}
