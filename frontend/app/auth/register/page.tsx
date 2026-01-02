"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { signUpWithEmail } from "@/lib/auth-client";

export default function Page() {
  const router = useRouter();

  async function handleSubmit(values: {
    email: string;
    password: string;
    name: string;
  }) {
    await signUpWithEmail(values.email, values.password, values.name);
    router.push("/dashboard");
  }

  return <RegisterForm onSubmit={handleSubmit} />;
}
