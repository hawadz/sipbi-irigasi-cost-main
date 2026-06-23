import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History } from "lucide-react";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  
  const items = [
    { to: "/", label: "Beranda", icon: LayoutDashboard },
    { to: "/calculator", label: "Kalkulator", icon: CalcIcon },
    { to: "/analytics", label: "Analisis", icon: BarChart3 },
    { to: "/riwayat", label: "Riwayat", icon: History },
  ];

  return (
    <aside
      className={`shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-sidebar-border print:hidden transition-all duration-300 ease-in-out h-screen ${
        isOpen ? "w-64 border-r" : "w-0 border-r-0 overflow-hidden"
      }`}
    >
      <div className="w-64 p-6 flex flex-col h-full">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10 text-primary shrink-0">
          <span>IriCost</span>
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        </Link>
        
        {/* MENU NAVIGASI */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {items.map((it, i) => {
            const active = path === it.to;
            return (
              <Link
                key={i}
                to={it.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <it.icon className={`h-4.5 w-4.5 ${active ? "text-primary" : ""}`} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        
        {/* FOOTER SIDEBAR */}
        <div className="mt-auto pt-6 shrink-0">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 text-xs text-sidebar-foreground/80">
            <div className="font-semibold text-primary mb-1.5 text-sm">IriCost</div>
            <p className="leading-relaxed">Standar resmi perhitungan biaya operasional & pemeliharaan irigasi.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}