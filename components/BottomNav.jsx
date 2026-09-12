"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Palmtree, TrendingUp, Ticket, FileText } from "lucide-react";

const TABS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ferie-rol", label: "Ferie/ROL", icon: Palmtree },
  { href: "/ral", label: "RAL", icon: TrendingUp },
  { href: "/buoni-pasto", label: "Ticket", icon: Ticket },
  { href: "/documenti", label: "Documenti", icon: FileText },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Non mostrare la barra nella pagina Impostazioni: lì c'è già il tasto
  // "indietro" ed evitiamo di affollare la schermata.
  if (pathname?.startsWith("/settings")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-base-900/95 backdrop-blur border-t border-base-700 safe-bottom">
      <div className="max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium whitespace-nowrap transition ${
                active ? "text-accent" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
