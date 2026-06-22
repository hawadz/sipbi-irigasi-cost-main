import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, Save, Plus, Trash2, Printer, Menu } from "lucide-react";
import { BUILDINGS, TASKS, formatIDR, getAhspPrice, type BuildingKey } from "@/lib/aknop";
import { exportRAB } from "@/lib/exportExcel";
import { z } from "zod";
import { Toaster, toast } from "sonner";

const searchSchema = z.object({ daerah: z.string().optional() });

export const Route = createFileRoute("/calculator")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Calculator Hub - IriCost" },
      { name: "description", content: "Perhitungan biaya pemeliharaan bangunan pelengkap irigasi." },
    ],
  }),
  component: CalculatorPage,
});

type Row = { panjang: number | ""; lebar: number | ""; tinggi: number | ""; harga: number | "" };

export const getKategoriBiaya = (total: number) => {
  if (total > 50000000) return { label: "Rehabilitasi Berat", color: "bg-destructive text-destructive-foreground" };
  if (total >= 15000000) return { label: "Pemeliharaan Sedang", color: "bg-amber-500 text-white" };
  if (total > 0) return { label: "Pemeliharaan Ringan", color: "bg-primary text-primary-foreground" };
  return { label: "-", color: "bg-muted text-muted-foreground" };
};

function CalculatorPage() {
  const search = Route.useSearch();

  // STATE UNTUK BUKA/TUTUP SIDEBAR (Default Terbuka)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [daerah, setDaerah] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("iricost_daerah") || search.daerah || "";
    return search.daerah || "";
  });

  const [nomenklatur, setNomenklatur] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("iricost_nomenklatur") || "";
    return "";
  });

  const [building, setBuilding] = useState<BuildingKey | "">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("iricost_building") as BuildingKey) || "";
    return "";
  });

  const [rows, setRows] = useState<Record<string, Row>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("iricost_rows");
      if (saved) return JSON.parse(saved);
    }
    return {};
  });

  const tasks = building ? TASKS[building] : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("iricost_daerah", daerah);
      localStorage.setItem("iricost_nomenklatur", nomenklatur);
      localStorage.setItem("iricost_building", building);
      localStorage.setItem("iricost_rows", JSON.stringify(rows));
    }
  }, [daerah, nomenklatur, building, rows]);

  const handleChange = (idx: number, field: keyof Row, value: number | "") => {
    if (typeof value === 'number' && value < 0) return;
    setRows((prev) => {
      const cur = prev[idx] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
      return { ...prev, [idx]: { ...cur, [field]: value } };
    });
  };

  const reset = () => {
    setRows({});
    if (typeof window !== "undefined") localStorage.removeItem("iricost_rows");
    toast.info("Angka perhitungan telah direset.");
  };

  const calculateVolume = (taskName: string, r?: Row) => {
    if (!r) return { vol: 0, unit: "m²", isDiscounted: false };
    const p = Number(r.panjang) || 0;
    const l = Number(r.lebar) || 0;
    const t = Number(r.tinggi);

    let vol = t > 0 ? p * l * t : p * l;
    let unit = t > 0 ? "m³" : "m²";
    let isDiscounted = false;

    const taskLower = taskName.toLowerCase();
    if (taskLower.includes("bongkar pasangan batu") ||
      taskLower.includes("pembongkaran pasangan batu") ||
      taskLower.includes("pembongkaran bronjong") ||
      taskLower.includes("bongkar bronjong") ||
      taskLower.includes("bongkar batu") ||
      taskLower.includes("bongkaran beton") ||
      taskLower.includes("bongkar beton")) {
      vol = vol * 0.2;
      isDiscounted = true;
    }

    return { vol: Number(vol.toFixed(2)), unit, isDiscounted };
  };

  const total = useMemo(() => {
    return tasks.reduce((sum, taskName, i) => {
      const { vol } = calculateVolume(taskName, rows[i]);
      const ahspPrice = getAhspPrice(taskName);
      const harga = ahspPrice > 0 ? ahspPrice : (Number(rows[i]?.harga) || 0);
      return sum + vol * harga;
    }, 0);
  }, [rows, tasks]);

  const kategori = getKategoriBiaya(total);

  const handleExport = async () => {
    if (!building) {
      toast.error("Pilih bangunan terlebih dahulu!");
      return;
    }
    const toastId = toast.loading("Menyiapkan file Excel RAB...");
    try {
      const itemsToExport = tasks.map((t, i) => {
        const r = rows[i] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
        const { vol, unit } = calculateVolume(t, r);
        const ahspPrice = getAhspPrice(t);
        const harga = ahspPrice > 0 ? ahspPrice : (Number(r.harga) || 0);
        return { uraian: t, satuan: unit, volume: vol, hargaSatuan: harga, jumlahBiaya: vol * harga };
      });

      await exportRAB(daerah, nomenklatur, building, kategori.label, itemsToExport, total);

      // SIMPAN SEMUA DATA ROW AGAR BISA DOWNLOAD ULANG
      const newHistory = {
        id: new Date().getTime(),
        tanggal: new Date().toLocaleString("id-ID"),
        daerah,
        nomenklatur,
        building,
        total,
        rows, // <--- DATA DIMENSI & HARGA DISIMPAN DI SINI
      };
      const existingHistory = JSON.parse(localStorage.getItem("iricost_history") || "[]");
      localStorage.setItem("iricost_history", JSON.stringify([newHistory, ...existingHistory]));

      toast.success("Berhasil mengunduh RAB!", { id: toastId });
    } catch (error) {
      toast.error("Terjadi kesalahan.", { id: toastId });
    }
  };

  const preventMinus = (e: React.KeyboardEvent) => {
    if (e.key === '-' || e.key === 'e') e.preventDefault();
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero overflow-x-hidden">
      <Toaster position="top-right" richColors />

      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 min-w-0 bg-background/50 transition-all duration-300">
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30 print:hidden">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 -ml-1.5 hover:bg-muted rounded-md transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                title="Buka/Tutup Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span>IriCost / Calculator Hub</span>
            </div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">← Kembali ke Beranda</Link>
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto print:p-0 print:max-w-full">
          <div className="mb-8 print:mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi
            </h1>
            <p className="mt-2 text-muted-foreground print:hidden">
              Kalkulasi otomatis dimensi, volume, dan harga satuan AHSP.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 md:p-8 print:shadow-none print:border-none print:p-0">
            <div className="grid md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Daerah Irigasi</label>
                <input value={daerah} onChange={(e) => setDaerah(e.target.value)} placeholder="Contoh: DI Cikondang" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition print:border-none print:p-0 print:text-base print:font-semibold" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Nomenklatur Bangunan</label>
                <input value={nomenklatur} onChange={(e) => setNomenklatur(e.target.value)} placeholder="Contoh: B.G. 1" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition print:border-none print:p-0 print:text-base print:font-semibold" />
              </div>
              <div className="print:hidden">
                <label className="text-sm font-medium text-foreground">Pilih Bangunan Pelengkap</label>
                <select value={building} onChange={(e) => setBuilding(e.target.value as BuildingKey)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition">
                  <option value="">- Pilih bangunan -</option>
                  {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="hidden print:block">
                <label className="text-sm font-medium text-foreground">Jenis Bangunan</label>
                <div className="mt-2 text-base font-semibold">{building || "-"}</div>
              </div>
            </div>

            {building && (
              <div className="mt-10 print:mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary print:hidden" />
                    Rincian Pekerjaan - {building} {nomenklatur && `(${nomenklatur})`}
                  </h2>
                  <button onClick={reset} className="text-sm text-muted-foreground hover:text-destructive transition flex items-center gap-1 print:hidden">
                    <Trash2 className="h-3.5 w-3.5" /> Reset Angka
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border print:border-gray-300">
                  <table className="w-full text-sm print:text-xs">
                    <thead className="bg-muted/50 text-muted-foreground print:bg-gray-100 print:text-black">
                      <tr>
                        <th className="text-left py-3 px-3 font-medium w-10 border-b print:border-gray-300">No</th>
                        <th className="text-left py-3 px-3 font-medium min-w-[200px] border-b print:border-gray-300">Rincian Pekerjaan</th>
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">P (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">L (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">T (m)</th>
                        <th className="text-center py-3 px-3 font-medium w-24 border-b print:border-gray-300">Volume</th>
                        <th className="text-left py-3 px-3 font-medium w-36 border-b print:border-gray-300">Harga Satuan (Rp)</th>
                        <th className="text-right py-3 px-4 font-medium w-36 border-b print:border-gray-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => {
                        const r = rows[i];
                        const { vol, unit, isDiscounted } = calculateVolume(t, r);
                        const ahspPrice = getAhspPrice(t);
                        const harga = ahspPrice > 0 ? ahspPrice : (Number(r?.harga) || 0);
                        const sub = vol * harga;

                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition print:border-gray-300">
                            <td className="py-2 px-3 text-muted-foreground print:text-black">{i + 1}</td>
                            <td className="py-2 px-3 text-foreground font-medium print:text-black">
                              {t}
                              {isDiscounted && <div className="text-[10px] text-amber-500 font-semibold mt-0.5">*Vol otomatis × 20%</div>}
                            </td>
                            <td className="py-2 px-2">
                              <input type="number" min="0" onKeyDown={preventMinus} value={r?.panjang ?? ""} onChange={(e) => handleChange(i, "panjang", e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-" />
                            </td>
                            <td className="py-2 px-2">
                              <input type="number" min="0" onKeyDown={preventMinus} value={r?.lebar ?? ""} onChange={(e) => handleChange(i, "lebar", e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-" />
                            </td>
                            <td className="py-2 px-2">
                              <input type="number" min="0" onKeyDown={preventMinus} value={r?.tinggi ?? ""} onChange={(e) => handleChange(i, "tinggi", e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-" />
                            </td>
                            <td className="py-2 px-3 text-center bg-muted/20 print:bg-transparent">
                              <span className="font-semibold text-foreground print:text-black">{vol || "-"}</span>
                              <span className="text-xs text-muted-foreground ml-1 print:text-black">{vol > 0 ? unit : ""}</span>
                            </td>
                            <td className="py-2 px-3">
                              {ahspPrice > 0 ? (
                                <div className="px-3 py-1.5 text-sm font-semibold text-primary bg-primary/5 rounded-md border border-primary/20 print:border-none print:bg-transparent print:p-0 print:text-black">
                                  {formatIDR(ahspPrice)}
                                </div>
                              ) : (
                                <input type="number" min="0" onKeyDown={preventMinus} value={r?.harga ?? ""} onChange={(e) => handleChange(i, "harga", e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="Rp 0" />
                              )}
                            </td>
                            <td className="py-2 px-4 text-right font-bold text-foreground tabular-nums print:text-black">
                              {formatIDR(sub)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-mint border border-border p-6 print:bg-transparent print:border-t-2 print:border-black print:rounded-none print:p-4 print:mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground print:text-black print:font-semibold">Total Biaya Pemeliharaan</div>
                    <div className="mt-1 text-3xl md:text-4xl font-bold text-foreground tabular-nums print:text-black print:text-2xl">
                      {formatIDR(total)}
                    </div>
                    {total > 0 && (
                      <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${kategori.color} print:bg-transparent print:text-black print:border print:border-black`}>
                        Kategori Penanganan: {kategori.label}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 print:hidden">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white border border-input px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all">
                      <Printer className="h-4 w-4" /> Cetak PDF
                    </button>
                    <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all">
                      <Save className="h-4 w-4" /> Export Excel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Menu Master AHSP dihilangkan
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