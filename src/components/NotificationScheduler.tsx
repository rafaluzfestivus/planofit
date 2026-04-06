"use client";

import { useEffect } from "react";

interface Log {
  id: string;
  scheduledAt: string;
  status: string;
  routine: { snoozeMinutes: number; name: string };
}

interface Props {
  logs: Log[];
}

export function NotificationScheduler({ logs }: Props) {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const log of logs) {
      if (log.status !== "PENDING") continue;

      const scheduledTime = new Date(log.scheduledAt).getTime();
      const now = Date.now();
      const delay = scheduledTime - now;

      // Schedule notification at the right time (or immediately if overdue)
      const scheduleNotification = (extraDelay: number) => {
        const t = setTimeout(async () => {
          // Re-check status before sending
          const res = await fetch(`/api/push/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId: log.id }),
          });
          const data = await res.json();

          if (!data.skipped) {
            // Re-schedule snooze via SW
          }
        }, extraDelay);
        timers.push(t);
      };

      if (delay > 0) {
        scheduleNotification(delay);
      } else if (delay > -60 * 60 * 1000) {
        // Only send if less than 1hr overdue
        scheduleNotification(100);
      }
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [logs]);

  return null;
}
