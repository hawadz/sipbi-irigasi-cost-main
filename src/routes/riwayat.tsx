import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, Trash2, Clock } from "lucide-react";
import { formatIDR } from "@/lib/aknop";
// Mengambil fungsi kategori dari calculator
import { getKategoriBiaya } from "./calculator";

export const Route = createFileRoute("/riwayat")({
  head: () => ({
    meta: [{ title: "Riwayat - SIPBI" }],
  }),
  component: RiwayatPage,
});

type HistoryRecord = {
  id: number;
  tanggal: string;
  daerah: string;
  building: string;
  kondisi: string;
  total: number;
};

function RiwayatPage() {
  const [isClient, setIsClient] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("sipbi_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleDelete = (id: number) => {
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    localStorage.setItem("sipbi_history", JSON.stringify(filtered));
  };

  const handleClearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat perhitungan?")) {
      setHistory([]);
      localStorage.removeItem("sipbi_history");
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      <Sidebar />

      <main className="flex-1 min-w-0 bg-background/50">
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="text-sm text-muted-foreground font-medium">SIPBI / Riwayat</div>
            <Link to="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition">Ke Calculator Hub →</Link>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Riwayat Perhitungan</h1>
              <p className="mt-2 text-muted-foreground">Catatan estimasi biaya yang pernah diekspor sebelumnya.</p>
            </div>
            {history.length > 0 && (
              <button onClick={handleClearAll} className="inline-flex items-center gap-2 rounded-full bg-white border border-destructive/30 px-5 py-2.5 text-sm font-medium text-destructive shadow-sm hover:bg-destructive/10 transition-all">
                <Trash2 className="h-4 w-4" /> Hapus Semua
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-16 flex flex-col items-center justify-center text-center shadow-soft">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Riwayat Kosong</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Belum ada riwayat perhitungan. Riwayat akan otomatis tersimpan saat Anda mengekspor file Excel di Calculator Hub.</p>
              <Link to="/calculator" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all">
                <CalcIcon className="w-4 h-4" /> Buat Perhitungan Baru
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium w-48 border-b">Tanggal & Waktu</th>
                      <th className="text-left py-4 px-6 font-medium border-b">Daerah Irigasi</th>
                      <th className="text-left py-4 px-6 font-medium border-b">Bangunan & Kondisi</th>
                      <th className="text-right py-4 px-6 font-medium border-b">Total Biaya</th>
                      <th className="text-center py-4 px-6 font-medium w-24 border-b">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => {
                      const kategori = getKategoriBiaya(h.total);
                      return (
                        <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                          <td className="py-4 px-6 text-muted-foreground">{h.tanggal}</td>
                          <td className="py-4 px-6 font-medium text-foreground">{h.daerah || "-"}</td>
                          <td className="py-4 px-6">
                            <div className="text-foreground font-medium">{h.building}</div>
                            <div className="text-xs text-muted-foreground mt-1">Kondisi: {h.kondisi || "-"}</div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-bold text-foreground tabular-nums">{formatIDR(h.total)}</div>
                            <div className="mt-1.5 inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                              {kategori.label}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => handleDelete(h.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition" title="Hapus Riwayat">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/calculator", label: "Calculator Hub", icon: CalcIcon },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/riwayat", label: "Riwayat", icon: History }, // Riwayat diaktifkan
  ];
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground flex-col p-6 border-r border-sidebar-border print:hidden">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10 text-primary">
        <span>SIPBI</span>
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
      </Link>
      <nav className="flex flex-col gap-2">
        {items.map((it, i) => {
          const active = path === it.to;
          return (
            <Link key={i} to={it.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${active ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"} ${it.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}>
              <it.icon className={`h-4.5 w-4.5 ${active ? "text-primary" : ""}`} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-primary/5 border border-primary/10 p-5 text-xs text-sidebar-foreground/80">
        <div className="font-semibold text-primary mb-1.5 text-sm">Berbasis AKNOP</div>
        <p className="leading-relaxed">Standar resmi perhitungan biaya operasional & pemeliharaan irigasi.</p>
      </div>
    </aside>
  );
}