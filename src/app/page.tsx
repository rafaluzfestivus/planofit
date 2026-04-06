"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw } from "lucide-react";
import { TodayCard } from "@/components/TodayCard";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import { CATEGORIES } from "@/types";

interface Log {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  targetValue: number | null;
  actualValue: number | null;
  unit: string | null;
  status: "PENDING" | "DONE" | "SKIPPED";
  notes: string | null;
  routine: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    snoozeMinutes: number;
  };
}

export default function TodayPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/today");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const today = new Date();
  const dateLabel = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });

  const pending = logs.filter((l) => l.status === "PENDING");
  const done = logs.filter((l) => l.status === "DONE");
  const skipped = logs.filter((l) => l.status === "SKIPPED");

  const filtered =
    filter === "ALL"
      ? logs
      : logs.filter((l) => l.routine.category === filter);

  const grouped = {
    pending: filtered.filter((l) => l.status === "PENDING"),
    done: filtered.filter((l) => l.status === "DONE"),
    skipped: filtered.filter((l) => l.status === "SKIPPED"),
  };

  return (
    <div>
      <NotificationScheduler logs={logs} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white capitalize">{dateLabel}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {done.length}/{logs.length} rotinas concluídas
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {logs.length > 0 && (
        <div className="w-full bg-slate-700 rounded-full h-2 mb-5">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(done.length / logs.length) * 100}%` }}
          />
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
          ⏳ {pending.length} pendentes
        </span>
        <span className="text-xs bg-green-900/40 text-green-400 px-3 py-1 rounded-full">
          ✅ {done.length} feitos
        </span>
        <span className="text-xs bg-slate-800 text-slate-500 px-3 py-1 rounded-full">
          ❌ {skipped.length} pulados
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        <button
          onClick={() => setFilter("ALL")}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
            filter === "ALL"
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
          }`}
        >
          Tudo
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              filter === cat.value
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {loading && logs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">Nenhuma rotina para hoje</p>
          <p className="text-slate-600 text-sm">
            Vá em Rotinas para adicionar suas atividades
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Pendentes
              </h2>
              <div className="space-y-2">
                {grouped.pending.map((log) => (
                  <TodayCard key={log.id} log={log} onRefresh={load} />
                ))}
              </div>
            </section>
          )}
          {grouped.done.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">
                Concluídos
              </h2>
              <div className="space-y-2">
                {grouped.done.map((log) => (
                  <TodayCard key={log.id} log={log} onRefresh={load} />
                ))}
              </div>
            </section>
          )}
          {grouped.skipped.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Pulados
              </h2>
              <div className="space-y-2">
                {grouped.skipped.map((log) => (
                  <TodayCard key={log.id} log={log} onRefresh={load} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
