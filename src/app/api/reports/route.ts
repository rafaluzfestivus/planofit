import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7");
  const category = searchParams.get("category");

  const from = startOfDay(subDays(new Date(), days - 1));
  const to = endOfDay(new Date());

  const logs = await prisma.routineLog.findMany({
    where: {
      scheduledAt: { gte: from, lte: to },
      ...(category ? { routine: { category } } : {}),
    },
    include: { routine: true },
    orderBy: { scheduledAt: "asc" },
  });

  // Group by day
  const byDay: Record<string, { total: number; done: number; skipped: number }> = {};
  const byCategory: Record<string, { total: number; done: number }> = {};
  const byRoutine: Record<
    string,
    { name: string; category: string; total: number; done: number; totalValue: number; actualValue: number; unit: string | null }
  > = {};

  for (const log of logs) {
    const day = format(log.scheduledAt, "yyyy-MM-dd");
    const cat = log.routine.category;
    const rid = log.routineId;

    // By day
    if (!byDay[day]) byDay[day] = { total: 0, done: 0, skipped: 0 };
    byDay[day].total++;
    if (log.status === "DONE") byDay[day].done++;
    if (log.status === "SKIPPED") byDay[day].skipped++;

    // By category
    if (!byCategory[cat]) byCategory[cat] = { total: 0, done: 0 };
    byCategory[cat].total++;
    if (log.status === "DONE") byCategory[cat].done++;

    // By routine
    if (!byRoutine[rid]) {
      byRoutine[rid] = {
        name: log.routine.name,
        category: cat,
        total: 0,
        done: 0,
        totalValue: 0,
        actualValue: 0,
        unit: log.unit,
      };
    }
    byRoutine[rid].total++;
    if (log.status === "DONE") {
      byRoutine[rid].done++;
      byRoutine[rid].totalValue += log.targetValue ?? 0;
      byRoutine[rid].actualValue += log.actualValue ?? log.targetValue ?? 0;
    }
  }

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString(), days },
    summary: {
      total: logs.length,
      done: logs.filter((l) => l.status === "DONE").length,
      skipped: logs.filter((l) => l.status === "SKIPPED").length,
      pending: logs.filter((l) => l.status === "PENDING").length,
    },
    byDay,
    byCategory,
    byRoutine,
  });
}
