import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTodayLogs } from "@/lib/routines";

export async function POST() {
  await generateTodayLogs();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await generateTodayLogs();

  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const logs = await prisma.routineLog.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      routine: { isActive: true },
    },
    include: { routine: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(logs);
}
