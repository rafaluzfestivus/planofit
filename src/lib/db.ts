import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  let url = process.env.DATABASE_URL;

  // Fallback para dev local com SQLite
  if (!url) {
    url = `file:${path.resolve(process.cwd(), "dev.db")}`;
  }

  // Se for caminho relativo de arquivo, resolve para absoluto
  if (url.startsWith("file:./") || url.startsWith("file:../")) {
    const relativePath = url.replace("file:", "");
    url = `file:${path.resolve(process.cwd(), relativePath)}`;
  }

  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
