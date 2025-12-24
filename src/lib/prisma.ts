import { PrismaClient } from "@prisma/client";

// WHY: evitar múltiples instancias en dev con hot reload
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
