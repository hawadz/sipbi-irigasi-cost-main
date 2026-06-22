import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, Trash2, Clock, Menu, Download } from "lucide-react";
import { formatIDR, TASKS, getAhspPrice } from "@/lib/aknop";
import { getKategoriBiaya } from "./calculator";
import { exportRAB } from "@/lib/exportExcel";

export const Route = createFileRoute("/riwayat")({
  head: () => ({ meta: [{ title: "Riwayat - IriCost" }] }),
  component: RiwayatPage,
});

function RiwayatPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("iricost_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // FUNGSI DOWNLOAD ULANG
  const downloadUlang = async (h: any) => {
    const tasks = TASKS[h.building as BuildingKey] || [];
    const items = tasks.map((t: string, i: number) => {
      const r = h.rows[i] || { panjang: 0, lebar: 0, tinggi: 0, harga: 0 };
      const vol = (Number(r.tinggi) || 0) > 0 ? (Number(r.panjang) || 0) * (Number(r.lebar) || 0) * (Number(r.tinggi) || 0) : (Number(r.panjang) || 0) * (Number(r.lebar) || 0);
      const ahsp = getAhspPrice(t);
      const harga = ahsp > 0 ? ahsp : (Number(r.harga) || 0);
      return { uraian: t, satuan: (Number(r.tinggi) || 0) > 0 ? "m³" : "m²", volume: vol, hargaSatuan: harga, jumlahBiaya: vol * harga };
    });

    const kategori = getKategoriBiaya(h.total).label;
    await exportRAB(h.daerah, h.nomenklatur, h.building, kategori, items, h.total);
  };

  const handleDelete = (id: number) => {
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    localStorage.setItem("iricost_history", JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-1 min-w-0 bg-background/50 transition-all">
        <div className="border-b bg-background/70 backdrop-blur-md sticky top-0 z-30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-muted rounded-md"><Menu className="h-5 w-5" /></button>
            <span className="text-sm font-medium text-muted-foreground">IriCost / Riwayat</span>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Riwayat Perhitungan</h1>
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-4 px-6 text-left">Tanggal</th>
                  <th className="py-4 px-6 text-left">Daerah / Nomenklatur</th>
                  <th className="py-4 px-6 text-left">Bangunan</th>
                  <th className="py-4 px-6 text-right">Total Biaya</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b hover:bg-muted/30">
                    <td className="py-4 px-6">{h.tanggal}</td>
                    <td className="py-4 px-6 font-medium">{h.daerah} / {h.nomenklatur}</td>
                    <td className="py-4 px-6">{h.building}</td>
                    <td className="py-4 px-6 text-right font-bold">{formatIDR(h.total)}</td>
                    <td className="py-4 px-6 flex justify-center gap-2">
                      <button onClick={() => downloadUlang(h)} className="p-2 hover:bg-primary/10 text-primary rounded-lg" title="Download Excel">
                        <Download className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", label: "Beranda", icon: LayoutDashboard },
    { to: "/calculator", label: "Calculator RAB", icon: CalcIcon },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/riwayat", label: "Riwayat", icon: History },
  ];
  return (
    <aside
      className={`hidden md:flex shrink-0 bg-sidebar text-sidebar-foreground flex-col border-sidebar-border print:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-64 border-r" : "w-0 border-r-0"
        }`}
    >
      <div className="w-64 p-6 flex flex-col h-full">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10 text-primary">
          <span>IriCost</span>
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        </Link>
        <nav className="flex flex-col gap-2">
          {items.map((it, i) => {
            const active = path === it.to;
            return (
              <Link
                key={i}
                to={it.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${active
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
      </div>
    </aside>
  );
}