import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const prismaUrl = new URL(databaseUrl);
  // Prisma's PostgreSQL engine fails to connect to Neon when this libpq-only
  // option is copied into DATABASE_URL from Neon/Vercel's generated string.
  prismaUrl.searchParams.delete("channel_binding");
  process.env.DATABASE_URL = prismaUrl.toString();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
