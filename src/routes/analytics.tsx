import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, AlertCircle, PieChart as PieIcon, TrendingUp, Menu } from "lucide-react";
import { TASKS, formatIDR, getAhspPrice, type BuildingKey } from "@/lib/aknop";
import { getKategoriBiaya } from "./calculator";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [{ title: "Analytics Dashboard - IriCost" }],
  }),
  component: AnalyticsPage,
});

type Row = { panjang: number | ""; lebar: number | ""; tinggi: number | ""; harga: number | "" };

function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State untuk Sidebar

  const [daerah, setDaerah] = useState("-");
  const [nomenklatur, setNomenklatur] = useState("-");
  const [building, setBuilding] = useState<BuildingKey | "">("");
  const [rows, setRows] = useState<Record<string, Row>>({});

  useEffect(() => {
    setIsClient(true);
    // Kunci storage sudah disesuaikan dengan IriCost
    setDaerah(localStorage.getItem("iricost_daerah") || "-");
    setNomenklatur(localStorage.getItem("iricost_nomenklatur") || "-");
    setBuilding((localStorage.getItem("iricost_building") as BuildingKey) || "");
    
    const savedRows = localStorage.getItem("iricost_rows");
    if (savedRows) setRows(JSON.parse(savedRows));
  }, []);

  const tasks = building ? TASKS[building] : [];

  // Logika kalkulasi yang disamakan persis dengan Kalkulator (Diskon 20% & AHSP)
  const chartData = useMemo(() => {
    if (!building) return [];
    let data = tasks.map((t, i) => {
      const r = rows[i] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
      const p = Number(r.panjang) || 0;
      const l = Number(r.lebar) || 0;
      const t_val = Number(r.tinggi) || 0;
      
      let vol = t_val > 0 ? p * l * t_val : p * l;

      // Aturan khusus: Pembongkaran dikali 20%
      const taskLower = t.toLowerCase();
      if (taskLower.includes("bongkar pasangan batu") || 
          taskLower.includes("pembongkaran pasangan batu") ||
          taskLower.includes("pembongkaran bronjong") ||
          taskLower.includes("bongkar bronjong") ||
          taskLower.includes("bongkar batu") ||
          taskLower.includes("bongkaran beton") ||
          taskLower.includes("bongkar beton")) {
        vol = vol * 0.2;
      }

      // Integrasi AHSP
      const ahspPrice = getAhspPrice(t);
      const harga = ahspPrice > 0 ? ahspPrice : (Number(r.harga) || 0);

      return { 
        name: t, 
        Singkatan: t.split(" ").slice(0, 2).join(" "), 
        Subtotal: vol * harga, 
        Volume: vol 
      };
    });
    return data.filter(d => d.Subtotal > 0).sort((a, b) => b.Subtotal - a.Subtotal);
  }, [building, rows, tasks]);

  const totalBiaya = useMemo(() => chartData.reduce((sum, item) => sum + item.Subtotal, 0), [chartData]);
  const kategoriData = getKategoriBiaya(totalBiaya);

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-4 rounded-xl shadow-xl">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.name}</p>
          <p className="text-primary font-bold">{formatIDR(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex bg-gradient-hero overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 min-w-0 bg-background/50 transition-all duration-300">
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-1.5 -ml-1.5 hover:bg-muted rounded-md transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                title="Buka/Tutup Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span>IriCost / Analytics</span>
            </div>
            <Link to="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition">Ke Calculator Hub →</Link>
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Analisis Biaya Pemeliharaan</h1>
            <p className="mt-2 text-muted-foreground">Visualisasi proporsi anggaran berdasarkan data dari Calculator Hub.</p>
          </div>

          {!building || chartData.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-16 flex flex-col items-center justify-center text-center shadow-soft">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Data Analisis Kosong</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Belum ada data perhitungan yang bisa dianalisis. Silakan isi angka di Calculator Hub terlebih dahulu.</p>
              <Link to="/calculator" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all">
                <CalcIcon className="w-4 h-4" /> Mulai Perhitungan
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-soft relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><TrendingUp className="w-16 h-16" /></div>
                  <div className="text-sm font-medium text-muted-foreground">Total Estimasi Biaya</div>
                  <div className="mt-2 text-3xl font-bold text-foreground">{formatIDR(totalBiaya)}</div>
                  <div className={`mt-2 inline-flex px-2 py-1 rounded-md text-xs font-semibold ${kategoriData.color}`}>
                    {kategoriData.label}
                  </div>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                  <div className="text-sm font-medium text-muted-foreground">Daerah Irigasi</div>
                  <div className="mt-2 text-xl font-bold text-foreground line-clamp-1">{daerah === "-" ? "Belum diisi" : daerah}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Wilayah Perencanaan</div>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                  <div className="text-sm font-medium text-muted-foreground">Jenis Bangunan</div>
                  <div className="mt-2 text-xl font-bold text-foreground">{building}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Nomenklatur: {nomenklatur === "-" || nomenklatur === "" ? "Tidak ada" : nomenklatur}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> Distribusi Biaya per Pekerjaan
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Singkatan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="Subtotal" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-primary" /> Proporsi Anggaran Terbesar
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData.slice(0, 5)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="Subtotal" stroke="none">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">3 Pekerjaan Termahal</div>
                    {chartData.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate pr-4">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="truncate text-foreground">{item.Singkatan}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{((item.Subtotal / totalBiaya) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
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
      className={`hidden md:flex shrink-0 bg-sidebar text-sidebar-foreground flex-col border-sidebar-border print:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-64 border-r" : "w-0 border-r-0"
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
      </div>
    </aside>
  );
}