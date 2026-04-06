"use client";

import { useCallback, useEffect, useState } from "react";
import { format, addDays, startOfDay, isSameDay, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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
  status: "PENDING" | "DONE" | "SKIPPED" | "PARTIAL";
  notes: string | null;
  routine: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    snoozeMinutes: number;
  };
}

// Returns the 7 days of the week containing the given date (Mon–Sun)
function weekOf(date: Date): Date[] {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export default function TodayPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  // weekAnchor controls which week is displayed in the strip
  const [weekAnchor, setWeekAnchor] = useState<Date>(startOfDay(new Date()));

  const today = startOfDay(new Date());
  const isToday = isSameDay(selectedDate, today);
  const week = weekOf(weekAnchor);

  // When selecting a date outside the current week, auto-jump the week strip
  function selectDate(date: Date) {
    setSelectedDate(date);
    setWeekAnchor(date);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const res = await fetch(`/api/today?date=${dateStr}`);
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    load();
    if (!isToday) return;
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load, isToday]);

  const dateLabel = format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const monthLabel = format(weekAnchor, "MMMM yyyy", { locale: ptBR });

  const pending = logs.filter((l) => l.status === "PENDING");
  const partial = logs.filter((l) => l.status === "PARTIAL");
  const done = logs.filter((l) => l.status === "DONE");
  const skipped = logs.filter((l) => l.status === "SKIPPED");

  const filtered =
    filter === "ALL"
      ? logs
      : logs.filter((l) => l.routine.category === filter);

  const grouped = {
    pending: filtered.filter((l) => l.status === "PENDING"),
    partial: filtered.filter((l) => l.status === "PARTIAL"),
    done: filtered.filter((l) => l.status === "DONE"),
    skipped: filtered.filter((l) => l.status === "SKIPPED"),
  };

  return (
    <div>
      <NotificationScheduler logs={logs} />

      {/* Week navigation */}
      <div className="mb-4">
        {/* Month label + arrows + Hoje */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setWeekAnchor((a) => subWeeks(a, 1))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300 capitalize">
              {monthLabel}
            </span>
            {!isToday && (
              <button
                onClick={() => { selectDate(today); }}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-full font-medium transition-all"
              >
                Hoje
              </button>
            )}
          </div>

          <button
            onClick={() => setWeekAnchor((a) => addWeeks(a, 1))}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-1">
          {week.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isSameDay(date, today);
            const isPast = date < today;

            return (
              <button
                key={date.toISOString()}
                onClick={() => selectDate(date)}
                className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : isTodayDate
                    ? "bg-slate-700 text-white ring-1 ring-indigo-400"
                    : isPast
                    ? "bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {format(date, "EEE", { locale: ptBR })}
                </span>
                <span className="text-base font-bold leading-tight">
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
        {partial.length > 0 && (
          <span className="text-xs bg-orange-900/40 text-orange-400 px-3 py-1 rounded-full">
            ⏸ {partial.length} parciais
          </span>
        )}
        <span className="text-xs bg-green-900/40 text-green-400 px-3 py-1 rounded-full">
          ✅ {done.length} feitos
        </span>
        <span className="text-xs bg-slate-800 text-slate-500 px-3 py-1 rounded-full">
          ❌ {skipped.length} pulados
        </span>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 mb-5"
        style={{ scrollbarWidth: "none" }}
      >
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
          <p className="text-slate-400 text-lg mb-2">Nenhuma rotina para este dia</p>
          <p className="text-slate-600 text-sm">
            Vá em Rotinas para adicionar suas atividades
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.partial.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3">
                Em progresso
              </h2>
              <div className="space-y-2">
                {grouped.partial.map((log) => (
                  <TodayCard key={log.id} log={log} onRefresh={load} />
                ))}
              </div>
            </section>
          )}
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
