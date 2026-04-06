"use client";

import { useState } from "react";
import { CheckCircle, Clock, SkipForward, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoryBadge } from "./CategoryBadge";
import { CompleteLogModal } from "./CompleteLogModal";
import { cn } from "@/lib/cn";

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
  };
}

interface Props {
  log: Log;
  onRefresh: () => void;
}

export function TodayCard({ log, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);

  const isOverdue =
    log.status === "PENDING" && new Date(log.scheduledAt) < new Date();

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border p-4 transition-all",
          log.status === "DONE" && "bg-slate-800/50 border-green-800/30 opacity-75",
          log.status === "SKIPPED" && "bg-slate-800/30 border-slate-700/30 opacity-50",
          log.status === "PENDING" && !isOverdue && "bg-slate-800 border-slate-700 hover:border-slate-600",
          log.status === "PENDING" && isOverdue && "bg-slate-800 border-red-700/50 animate-pulse-subtle"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div className="mt-0.5">
            {log.status === "DONE" ? (
              <CheckCircle size={22} className="text-green-400" />
            ) : log.status === "SKIPPED" ? (
              <SkipForward size={22} className="text-slate-500" />
            ) : (
              <Clock
                size={22}
                className={isOverdue ? "text-red-400" : "text-slate-500"}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-semibold",
                  log.status === "DONE" && "line-through text-slate-400",
                  log.status === "SKIPPED" && "line-through text-slate-500",
                  log.status === "PENDING" && "text-white"
                )}
              >
                {log.routine.name}
              </span>
              <CategoryBadge category={log.routine.category} />
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span>
                {format(new Date(log.scheduledAt), "HH:mm", { locale: ptBR })}
              </span>
              {log.targetValue && (
                <span>
                  Meta: {log.targetValue} {log.unit}
                </span>
              )}
              {log.status === "DONE" && log.actualValue !== null && (
                <span className="text-green-500">
                  Feito: {log.actualValue} {log.unit}
                </span>
              )}
              {isOverdue && log.status === "PENDING" && (
                <span className="text-red-400 font-medium">Atrasado</span>
              )}
            </div>

            {log.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">{log.notes}</p>
            )}
          </div>

          {/* Action button */}
          {log.status === "PENDING" && (
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              Registrar <ChevronRight size={12} />
            </button>
          )}

          {log.status === "DONE" && (
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <CompleteLogModal
          log={log as Parameters<typeof CompleteLogModal>[0]["log"]}
          onClose={() => setShowModal(false)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}
