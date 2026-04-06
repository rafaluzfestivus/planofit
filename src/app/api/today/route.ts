import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLogsForDate } from "@/lib/routines";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function POST() {
  await generateLogsForDate(new Date());
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  const date = dateParam ? parseISO(dateParam) : new Date();

  await generateLogsForDate(date);

  const start = startOfDay(date);
  const end = endOfDay(date);

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
