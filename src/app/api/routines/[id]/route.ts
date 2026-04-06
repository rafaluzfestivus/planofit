import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id },
    include: { logs: { orderBy: { scheduledAt: "desc" }, take: 30 } },
  });
  if (!routine) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(routine);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.targetValue !== undefined)
    data.targetValue = body.targetValue ? parseFloat(body.targetValue) : null;
  if (body.unit !== undefined) data.unit = body.unit;
  if (body.frequency !== undefined) data.frequency = body.frequency;
  if (body.days !== undefined)
    data.days = body.days ? JSON.stringify(body.days) : null;
  if (body.times !== undefined) data.times = JSON.stringify(body.times);
  if (body.notifyBefore !== undefined) data.notifyBefore = body.notifyBefore;
  if (body.snoozeMinutes !== undefined) data.snoozeMinutes = body.snoozeMinutes;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const routine = await prisma.routine.update({ where: { id }, data });
  return NextResponse.json(routine);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.routine.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
