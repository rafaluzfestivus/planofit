import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const routines = await prisma.routine.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
    },
  });
  return NextResponse.json(routines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const routine = await prisma.routine.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      category: body.category,
      targetValue: body.targetValue ? parseFloat(body.targetValue) : null,
      unit: body.unit ?? null,
      frequency: body.frequency,
      days: body.days ? JSON.stringify(body.days) : null,
      times: JSON.stringify(body.times),
      notifyBefore: body.notifyBefore ?? 0,
      snoozeMinutes: body.snoozeMinutes ?? 10,
    },
  });

  return NextResponse.json(routine, { status: 201 });
}
