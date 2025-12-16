import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient;

function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      const adapter = new PrismaPg({ connectionString });
      prismaInstance = new PrismaClient({ adapter });
    } else {
      // Fallback for CLI usage when DATABASE_URL might not be set
      prismaInstance = new PrismaClient();
    }
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();
