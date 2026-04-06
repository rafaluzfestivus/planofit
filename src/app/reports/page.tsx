"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoryBadge } from "@/components/CategoryBadge";

interface ReportData {
  period: { from: string; to: string; days: number };
  summary: { total: number; done: number; skipped: number; pending: number };
  byDay: Record<string, { total: number; done: number; skipped: number }>;
  byCategory: Record<string, { total: number; done: number }>;
  byRoutine: Record<
    string,
    {
      name: string;
      category: string;
      total: number;
      done: number;
      totalValue: number;
      actualValue: number;
      unit: string | null;
    }
  >;
}

const PERIOD_OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "14 dias", value: 14 },
  { label: "30 dias", value: 30 },
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?days=${days}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const pct = (done: number, total: number) =>
    total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">Relatórios</h1>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setDays(o.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                days === o.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-white">{pct(data.summary.done, data.summary.total)}%</p>
              <p className="text-sm text-slate-400 mt-1">Taxa de conclusão</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-white">{data.summary.done}</p>
              <p className="text-sm text-slate-400 mt-1">Rotinas feitas</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-slate-500">{data.summary.skipped}</p>
              <p className="text-sm text-slate-500 mt-1">Puladas</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-slate-400">{data.summary.total}</p>
              <p className="text-sm text-slate-500 mt-1">Total geradas</p>
            </div>
          </div>

          {/* By day */}
          {Object.keys(data.byDay).length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Por dia</h2>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 divide-y divide-slate-700">
                {Object.entries(data.byDay)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([day, stats]) => (
                    <div key={day} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-medium text-white">
                          {format(parseISO(day), "dd/MM", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {format(parseISO(day), "EEE", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>{stats.done}/{stats.total}</span>
                          <span>{pct(stats.done, stats.total)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${pct(stats.done, stats.total)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* By category */}
          {Object.keys(data.byCategory).length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Por categoria</h2>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 divide-y divide-slate-700">
                {Object.entries(data.byCategory)
                  .sort(([, a], [, b]) => b.done / b.total - a.done / a.total)
                  .map(([cat, stats]) => (
                    <div key={cat} className="flex items-center gap-4 px-4 py-3">
                      <CategoryBadge category={cat} className="w-28 shrink-0 justify-center" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>{stats.done}/{stats.total}</span>
                          <span>{pct(stats.done, stats.total)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${pct(stats.done, stats.total)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* By routine */}
          {Object.keys(data.byRoutine).length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Por rotina</h2>
              <div className="space-y-2">
                {Object.entries(data.byRoutine)
                  .sort(([, a], [, b]) => b.done / b.total - a.done / a.total)
                  .map(([id, r]) => (
                    <div key={id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{r.name}</span>
                          <CategoryBadge category={r.category} />
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            pct(r.done, r.total) >= 80
                              ? "text-green-400"
                              : pct(r.done, r.total) >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {pct(r.done, r.total)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${pct(r.done, r.total)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>{r.done}/{r.total} dias</span>
                        {r.unit && r.done > 0 && (
                          <span>
                            Média: {(r.actualValue / r.done).toFixed(1)} {r.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {data.summary.total === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhum dado para este período ainda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
