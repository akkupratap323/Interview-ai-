import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

console.log("🔧 DB CLIENT - Initializing Prisma client");
console.log("🔧 DB CLIENT - DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("🔧 DB CLIENT - NODE_ENV:", process.env.NODE_ENV);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  console.log("🔧 DB CLIENT - Set global prisma instance");
}

console.log("🔧 DB CLIENT - Prisma client ready");
