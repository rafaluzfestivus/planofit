import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { logId } = body;

  const log = await prisma.routineLog.findUnique({
    where: { id: logId },
    include: { routine: true },
  });

  if (!log || log.status !== "PENDING") {
    return NextResponse.json({ skipped: true });
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No subscriptions" }, { status: 404 });
  }

  const payload = {
    title: `⏰ ${log.routine.name}`,
    body: log.targetValue
      ? `Meta: ${log.targetValue} ${log.unit ?? ""}`
      : "Hora de fazer!",
    routineId: log.routineId,
    logId: log.id,
    snoozeMinutes: log.routine.snoozeMinutes,
    requireInteraction: true,
  };

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Push errors:", failed);
  }

  return NextResponse.json({ sent: subscriptions.length - failed.length });
}
