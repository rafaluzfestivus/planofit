import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "PlanOFit",
  description: "Gerencie suas rotinas diárias",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "PlanOFit" },
};

export const viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full bg-slate-900 text-white antialiased flex flex-col">
        <ServiceWorkerRegistrar />
        <NavBar />
        <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
