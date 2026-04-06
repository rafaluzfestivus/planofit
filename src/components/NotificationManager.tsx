"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export function NotificationManager() {
  const [status, setStatus] = useState<"unknown" | "granted" | "denied" | "default">("unknown");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setStatus(Notification.permission as "granted" | "denied" | "default");
    }
    checkSubscription();
  }, []);

  async function checkSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setSubscribed(!!sub);
  }

  async function subscribe() {
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker não suportado neste navegador.");
      return;
    }

    const permission = await Notification.requestPermission();
    setStatus(permission as "granted" | "denied" | "default");
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const res = await fetch("/api/vapid");
    const { publicKey } = await res.json();

    if (!publicKey) {
      alert("VAPID não configurado. Adicione as chaves no .env e reinicie.");
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });

    setSubscribed(true);
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setSubscribed(false);
  }

  if (status === "unknown") return null;

  return (
    <div className="flex items-center gap-2">
      {subscribed ? (
        <button
          onClick={unsubscribe}
          className="flex items-center gap-1 text-xs text-green-400 hover:text-red-400 transition-colors"
          title="Desativar notificações"
        >
          <Bell size={14} />
          <span className="hidden sm:inline">Notificações ativas</span>
        </button>
      ) : (
        <button
          onClick={subscribe}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          title="Ativar notificações"
        >
          <BellOff size={14} />
          <span className="hidden sm:inline">Ativar notificações</span>
        </button>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
