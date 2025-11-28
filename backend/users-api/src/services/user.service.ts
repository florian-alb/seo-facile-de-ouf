import { prisma } from "../lib/prisma";

export async function createUser(name: string, email: string) {
  return await prisma.user.create({
    data: {
      name,
      email,
      generationIds: [],
    },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function addGenerationToUser(id: number, generationId: string) {
  const user = await getUserById(id);

  if (!user) {
    return null;
  }

  return await prisma.user.update({
    where: { id },
    data: {
      generationIds: [...user.generationIds, generationId],
    },
  });
}
