import { prisma } from "./db";
import { startOfDay, endOfDay } from "date-fns";

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

export function shouldRunOnDate(
  frequency: string,
  days: string | null,
  date: Date
): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  if (frequency === "DAILY") return true;
  const activeDays = getDaysArray(days);
  return activeDays.includes(dayOfWeek);
}

export function shouldRunToday(
  frequency: string,
  days: string | null
): boolean {
  return shouldRunOnDate(frequency, days, new Date());
}

export async function generateLogsForDate(date: Date) {
  const routines = await prisma.routine.findMany({
    where: { isActive: true },
  });

  const dateStart = startOfDay(date);
  const dateEnd = endOfDay(date);

  for (const routine of routines) {
    if (!shouldRunOnDate(routine.frequency, routine.days, date)) continue;

    const times = getTimesArray(routine.times);
    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledAt = new Date(dateStart);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const exactExisting = await prisma.routineLog.findFirst({
        where: { routineId: routine.id, scheduledAt },
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

export async function generateTodayLogs() {
  return generateLogsForDate(new Date());
}
