import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const routineId = searchParams.get("routineId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const logs = await prisma.routineLog.findMany({
    where: {
      ...(routineId ? { routineId } : {}),
      ...(from || to
        ? {
            scheduledAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { routine: true },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json(logs);
}
