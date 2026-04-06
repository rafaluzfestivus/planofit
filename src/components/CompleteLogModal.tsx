"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface Log {
  id: string;
  targetValue: number | null;
  actualValue: number | null;
  unit: string | null;
  status: string;
  notes: string | null;
  routine: {
    name: string;
    category: string;
  };
}

interface Props {
  log: Log;
  onClose: () => void;
  onSaved: () => void;
}

export function CompleteLogModal({ log, onClose, onSaved }: Props) {
  const [actualValue, setActualValue] = useState(
    log.actualValue?.toString() ?? log.targetValue?.toString() ?? ""
  );
  const [notes, setNotes] = useState(log.notes ?? "");
  const [status, setStatus] = useState<"DONE" | "SKIPPED">("DONE");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/logs/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        actualValue: actualValue !== "" ? actualValue : null,
        notes,
      }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">{log.routine.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Registrar conclusão</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="flex gap-3">
            <button
              onClick={() => setStatus("DONE")}
              className={cn(
                "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
                status === "DONE"
                  ? "bg-green-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              )}
            >
              ✅ Feito
            </button>
            <button
              onClick={() => setStatus("SKIPPED")}
              className={cn(
                "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
                status === "SKIPPED"
                  ? "bg-red-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              )}
            >
              ❌ Pulei
            </button>
          </div>

          {/* Value */}
          {log.targetValue !== null && status === "DONE" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quantidade realizada
                {log.unit && (
                  <span className="ml-1 text-slate-500">({log.unit})</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-indigo-500"
                  placeholder="0"
                  step="any"
                />
                {log.unit && (
                  <span className="text-slate-400 text-sm font-medium min-w-[3rem]">
                    {log.unit}
                  </span>
                )}
              </div>
              {log.targetValue && (
                <p className="text-xs text-slate-500 mt-1">
                  Meta: {log.targetValue} {log.unit}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows={2}
              placeholder="Ex: tomei com suco..."
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {saving ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
