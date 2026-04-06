import { prisma } from "./db";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export function getDaysArray(days: string | null): number[] {
  if (!days) return [0, 1, 2, 3, 4, 5, 6];
  try {
    return JSON.parse(days);
  } catch {
    return [0, 1, 2, 3, 4, 5, 6];
  }
}

export function getTimesArray(times: string): string[] {
  try {
    return JSON.parse(times);
  } catch {
    return [];
  }
}

export function shouldRunToday(
  frequency: string,
  days: string | null
): boolean {
  const today = new Date().getDay(); // 0 = Sunday
  if (frequency === "DAILY") return true;
  const activeDays = getDaysArray(days);
  return activeDays.includes(today);
}

export async function generateTodayLogs() {
  const routines = await prisma.routine.findMany({
    where: { isActive: true },
  });

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  for (const routine of routines) {
    if (!shouldRunToday(routine.frequency, routine.days)) continue;

    const times = getTimesArray(routine.times);
    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledAt = new Date(todayStart);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Check if log already exists for this routine+time today
      const existing = await prisma.routineLog.findFirst({
        where: {
          routineId: routine.id,
          scheduledAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          // Match by scheduled time within 1 min tolerance
        },
      });

      // Find exact time match
      const exactExisting = await prisma.routineLog.findFirst({
        where: {
          routineId: routine.id,
          scheduledAt: scheduledAt,
        },
      });

      if (!exactExisting) {
        await prisma.routineLog.create({
          data: {
            routineId: routine.id,
            scheduledAt,
            targetValue: routine.targetValue,
            unit: routine.unit,
            status: "PENDING",
          },
        });
      }
    }
  }
}
