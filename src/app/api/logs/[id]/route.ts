import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.actualValue !== undefined)
    data.actualValue =
      body.actualValue !== "" ? parseFloat(body.actualValue) : null;
  if (body.notes !== undefined) data.notes = body.notes;

  if (body.status === "DONE") data.completedAt = new Date();
  if (body.status === "PENDING" || body.status === "PARTIAL")
    data.completedAt = null;

  const log = await prisma.routineLog.update({ where: { id }, data });
  return NextResponse.json(log);
}
