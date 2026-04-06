"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, DAYS_OF_WEEK, Category } from "@/types";
import { cn } from "@/lib/cn";

interface RoutineFormData {
  name: string;
  description: string;
  category: Category;
  targetValue: string;
  unit: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  days: number[];
  times: string[];
  notifyBefore: number;
  snoozeMinutes: number;
}

interface Props {
  initial?: Partial<RoutineFormData> & { id?: string };
  onClose: () => void;
  onSaved: () => void;
}

const defaultForm: RoutineFormData = {
  name: "",
  description: "",
  category: "OTHER",
  targetValue: "",
  unit: "",
  frequency: "DAILY",
  days: [0, 1, 2, 3, 4, 5, 6],
  times: ["08:00"],
  notifyBefore: 0,
  snoozeMinutes: 10,
};

export function RoutineForm({ initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<RoutineFormData>({ ...defaultForm, ...initial });
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial?.id;

  function set<K extends keyof RoutineFormData>(key: K, value: RoutineFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }

  function addTime() {
    setForm((f) => ({ ...f, times: [...f.times, "12:00"] }));
  }

  function removeTime(idx: number) {
    setForm((f) => ({ ...f, times: f.times.filter((_, i) => i !== idx) }));
  }

  function updateTime(idx: number, value: string) {
    setForm((f) => {
      const times = [...f.times];
      times[idx] = value;
      return { ...f, times };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.times.length === 0) return alert("Adicione pelo menos um horário.");
    setSaving(true);

    const payload = {
      ...form,
      days: form.frequency === "DAILY" ? null : form.days,
    };

    const url = isEdit ? `/api/routines/${initial!.id}` : "/api/routines";
    const method = isEdit ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700 my-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Editar Rotina" : "Nova Rotina"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ex: Tomar água"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Opcional"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("category", cat.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                    form.category === cat.value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500"
                  )}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target value + unit */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Meta (opcional)</label>
              <input
                type="number"
                value={form.targetValue}
                onChange={(e) => set("targetValue", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Ex: 300"
                step="any"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Unidade</label>
              <input
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                placeholder="ml, mg..."
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Frequência</label>
            <div className="flex gap-2">
              {(["DAILY", "WEEKLY", "CUSTOM"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set("frequency", f)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium border transition-all",
                    form.frequency === f
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500"
                  )}
                >
                  {f === "DAILY" ? "Diário" : f === "WEEKLY" ? "Semanal" : "Personalizado"}
                </button>
              ))}
            </div>
          </div>

          {/* Days (for WEEKLY/CUSTOM) */}
          {form.frequency !== "DAILY" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Dias da semana</label>
              <div className="flex gap-1.5">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                      form.days.includes(d.value)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Times */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">Horários</label>
              <button
                type="button"
                onClick={addTime}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {form.times.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                  {form.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Snooze */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Avisar antes (min)
              </label>
              <input
                type="number"
                value={form.notifyBefore}
                onChange={(e) => set("notifyBefore", parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                min={0}
                max={60}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Repetir lembrete (min)
              </label>
              <input
                type="number"
                value={form.snoozeMinutes}
                onChange={(e) => set("snoozeMinutes", parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                min={1}
                max={120}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar rotina"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
