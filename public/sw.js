/* PlanOFit Service Worker - Push Notifications */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "PlanOFit", body: event.data.text() };
  }

  const {
    title,
    body,
    routineId,
    logId,
    snoozeMinutes = 10,
  } = data;

  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    requireInteraction: true,
    tag: `routine-${logId}`,
    renotify: true,
    vibrate: [300, 100, 300, 100, 300],
    data: { routineId, logId, snoozeMinutes },
    actions: [
      { action: "done", title: "✅ Feito!" },
      { action: "snooze", title: `⏰ ${snoozeMinutes}min` },
      { action: "skip", title: "❌ Pular" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { logId, routineId, snoozeMinutes } = event.notification.data || {};
  const action = event.action;

  event.waitUntil(
    (async () => {
      if (action === "done") {
        await fetch(`/api/logs/${logId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "DONE" }),
        });
        // Open app to fill in actual value
        const allClients = await clients.matchAll({ type: "window" });
        if (allClients.length > 0) {
          allClients[0].focus();
          allClients[0].postMessage({ type: "LOG_DONE", logId, routineId });
        } else {
          await clients.openWindow(`/?log=${logId}`);
        }
      } else if (action === "snooze") {
        // Re-send notification after snoozeMinutes
        await new Promise((resolve) =>
          setTimeout(resolve, snoozeMinutes * 60 * 1000)
        );
        await fetch(`/api/push/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logId }),
        });
      } else if (action === "skip") {
        await fetch(`/api/logs/${logId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SKIPPED" }),
        });
      } else {
        // Click on notification body - open app
        const allClients = await clients.matchAll({ type: "window" });
        if (allClients.length > 0) {
          allClients[0].focus();
          allClients[0].postMessage({ type: "OPEN_LOG", logId, routineId });
        } else {
          await clients.openWindow(`/?log=${logId}`);
        }
      }
    })()
  );
});
