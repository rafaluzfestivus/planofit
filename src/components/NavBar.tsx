"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, BarChart2, Settings } from "lucide-react";
import { NotificationManager } from "./NotificationManager";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Hoje", icon: LayoutDashboard },
  { href: "/routines", label: "Rotinas", icon: ListChecks },
  { href: "/reports", label: "Relatórios", icon: BarChart2 },
  { href: "/settings", label: "Config", icon: Settings },
];

export function NavBar() {
  const path = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="container mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-indigo-400">PlanOFit</span>
          <NotificationManager />
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 safe-area-pb">
        <div className="container mx-auto max-w-2xl flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-medium transition-colors",
                  active ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
