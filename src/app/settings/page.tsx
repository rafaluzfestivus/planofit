"use client";

import { useState } from "react";
import { Bell, Key, Info } from "lucide-react";
import { NotificationManager } from "@/components/NotificationManager";

export default function SettingsPage() {
  const [vapidGenerated, setVapidGenerated] = useState(false);

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-5">Configurações</h1>

      <div className="space-y-4">
        {/* Notifications */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Notificações</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Ative as notificações push para receber lembretes no seu dispositivo.
              Os alertas ficam ativos até você confirmar que fez a atividade.
            </p>

            <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
              <span className="text-sm text-slate-300">Status das notificações</span>
              <NotificationManager />
            </div>

            <div className="bg-slate-700/30 rounded-xl p-3 text-xs text-slate-500 space-y-1">
              <p>• Notificações aparecem no horário agendado</p>
              <p>• Ficam visíveis até você confirmar (feito/pular)</p>
              <p>• Podem se repetir conforme o intervalo configurado</p>
              <p>• Funciona em Chrome, Edge, Firefox e Safari 16.4+</p>
            </div>
          </div>
        </section>

        {/* VAPID Keys */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Configuração VAPID</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-400">
            <p>
              Para ativar as notificações push, você precisa gerar chaves VAPID
              e adicioná-las ao arquivo <code className="text-indigo-400">.env</code>.
            </p>

            <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-slate-500"># Execute no terminal:</p>
              <p className="text-green-400">npx web-push generate-vapid-keys</p>
              <p className="mt-2 text-slate-500"># Cole no .env:</p>
              <p>NEXT_PUBLIC_VAPID_PUBLIC_KEY=&quot;sua-chave-publica&quot;</p>
              <p>VAPID_PRIVATE_KEY=&quot;sua-chave-privada&quot;</p>
              <p>VAPID_EMAIL=&quot;mailto:seu@email.com&quot;</p>
            </div>

            <p className="text-slate-500 text-xs">
              Após adicionar as chaves, reinicie o servidor e ative as notificações.
            </p>
          </div>
        </section>

        {/* Google Calendar - coming soon */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-5 opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📅</span>
            <h2 className="font-semibold text-white">Google Agenda</h2>
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Em breve</span>
          </div>
          <p className="text-sm text-slate-500">
            Sincronização com o Google Agenda para visualizar suas rotinas no calendário.
          </p>
        </section>

        {/* Info */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Sobre</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-1">
            <p><span className="text-white font-medium">PlanOFit</span> — Gerenciador de rotinas</p>
            <p>Versão 1.0.0</p>
            <p className="text-slate-600 text-xs mt-2">
              Categorias: Skin Care · Sono · Remédio · Alimentação · Bomba · Trabalho · Outros
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
