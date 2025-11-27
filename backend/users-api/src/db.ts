import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

export type User = {
  id: number;
  name: string;
  email: string;
  generationIds: string[];
  createdAt: string;
};

export async function initDb() {
  // Retry pushing schema until Postgres is ready (simple backoff)
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("npx prisma db push", { stdio: "inherit" });
      break;
    } catch (e) {
      if (attempt === maxAttempts) {
        console.error("prisma db push failed after retries:", e);
        throw e;
      }
      // wait 1s before next attempt
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  await prisma.$connect();
}

export async function createUser(name: string, email: string): Promise<User> {
  const created = await prisma.user.create({
    data: { name, email, generationIds: [] },
  });
  return created as unknown as User;
}

export async function getUsers(): Promise<User[]> {
  return (await prisma.user.findMany({ orderBy: { id: "asc" } })) as unknown as User[];
}

export async function getUser(id: number): Promise<User | null> {
  return (await prisma.user.findUnique({ where: { id } })) as unknown as User | null;
}

export async function addGenerationToUser(id: number, generationId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  const arr: string[] = (user.generationIds as unknown as string[]) || [];
  arr.push(generationId);
  const updated = await prisma.user.update({ where: { id }, data: { generationIds: arr } });
  return updated as unknown as User;
}

export { prisma };
