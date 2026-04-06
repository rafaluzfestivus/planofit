"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { RoutineForm } from "@/components/RoutineForm";
import { CATEGORIES, Category } from "@/types";
import { cn } from "@/lib/cn";

interface Routine {
  id: string;
  name: string;
  description: string | null;
  category: string;
  targetValue: number | null;
  unit: string | null;
  isActive: boolean;
  frequency: string;
  days: string | null;
  times: string;
  snoozeMinutes: number;
  notifyBefore: number;
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/routines");
    const data = await res.json();
    setRoutines(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(routine: Routine) {
    await fetch(`/api/routines/${routine.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !routine.isActive }),
    });
    load();
  }

  async function deleteRoutine(id: string) {
    if (!confirm("Remover esta rotina? Os históricos serão apagados.")) return;
    await fetch(`/api/routines/${id}`, { method: "DELETE" });
    load();
  }

  function openEdit(r: Routine) {
    setEditing(r);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  const filtered =
    filter === "ALL" ? routines : routines.filter((r) => r.category === filter);
  const active = filtered.filter((r) => r.isActive);
  const inactive = filtered.filter((r) => !r.isActive);

  function parseTimes(times: string): string[] {
    try { return JSON.parse(times); } catch { return []; }
  }

  function freqLabel(r: Routine) {
    if (r.frequency === "DAILY") return "Diário";
    if (r.frequency === "WEEKLY") return "Semanal";
    return "Personalizado";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">Rotinas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        <button
          onClick={() => setFilter("ALL")}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
            filter === "ALL"
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
          }`}
        >
          Todas
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

      {loading ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : routines.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">Nenhuma rotina cadastrada</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-400 text-sm hover:text-indigo-300"
          >
            Criar sua primeira rotina →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Ativas ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    onEdit={() => openEdit(r)}
                    onDelete={() => deleteRoutine(r.id)}
                    onToggle={() => toggleActive(r)}
                    parseTimes={parseTimes}
                    freqLabel={freqLabel}
                  />
                ))}
              </div>
            </section>
          )}
          {inactive.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Inativas ({inactive.length})
              </h2>
              <div className="space-y-2">
                {inactive.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    onEdit={() => openEdit(r)}
                    onDelete={() => deleteRoutine(r.id)}
                    onToggle={() => toggleActive(r)}
                    parseTimes={parseTimes}
                    freqLabel={freqLabel}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showForm && (
        <RoutineForm
          initial={editing ? {
            id: editing.id,
            name: editing.name,
            description: editing.description ?? "",
            category: editing.category as Category,
            targetValue: editing.targetValue?.toString() ?? "",
            unit: editing.unit ?? "",
            frequency: editing.frequency as "DAILY" | "WEEKLY" | "CUSTOM",
            days: editing.days ? JSON.parse(editing.days) : [0,1,2,3,4,5,6],
            times: JSON.parse(editing.times),
            notifyBefore: editing.notifyBefore,
            snoozeMinutes: editing.snoozeMinutes,
          } : undefined}
          onClose={closeForm}
          onSaved={load}
        />
      )}
    </div>
  );
}

function RoutineCard({
  routine,
  onEdit,
  onDelete,
  onToggle,
  parseTimes,
  freqLabel,
}: {
  routine: Routine;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  parseTimes: (t: string) => string[];
  freqLabel: (r: Routine) => string;
}) {
  const times = parseTimes(routine.times);

  return (
    <div
      className={cn(
        "bg-slate-800 rounded-2xl border p-4 transition-all",
        routine.isActive ? "border-slate-700" : "border-slate-800 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{routine.name}</span>
            <CategoryBadge category={routine.category} />
          </div>
          {routine.description && (
            <p className="text-xs text-slate-500 mt-0.5">{routine.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
            <span>{freqLabel(routine)}</span>
            <span>🕒 {times.join(", ")}</span>
            {routine.targetValue && (
              <span>
                Meta: {routine.targetValue} {routine.unit}
              </span>
            )}
            <span>🔔 a cada {routine.snoozeMinutes}min</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              routine.isActive
                ? "text-green-400 hover:bg-green-900/20"
                : "text-slate-600 hover:bg-slate-700"
            )}
            title={routine.isActive ? "Desativar" : "Ativar"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
