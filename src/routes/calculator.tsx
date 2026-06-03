import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, Save, Plus, Trash2, Printer } from "lucide-react";
import { BUILDINGS, TASKS, formatIDR, type BuildingKey } from "@/lib/aknop";
import { z } from "zod";

const searchSchema = z.object({ daerah: z.string().optional() });

export const Route = createFileRoute("/calculator")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Calculator Hub - SIPBI" },
      { name: "description", content: "Perhitungan biaya pemeliharaan bangunan pelengkap irigasi." },
    ],
  }),
  component: CalculatorPage,
});

type Row = { panjang: number | ""; lebar: number | ""; tinggi: number | ""; harga: number | "" };

function CalculatorPage() {
  const search = Route.useSearch();
  
  // 1. AUTO-SAVE: Load data dari Local Storage saat pertama kali dibuka
  const [daerah, setDaerah] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("sipbi_daerah") || search.daerah || "";
    return search.daerah || "";
  });
  
  const [building, setBuilding] = useState<BuildingKey | "">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("sipbi_building") as BuildingKey) || "";
    return "";
  });
  
  const [rows, setRows] = useState<Record<string, Row>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sipbi_rows");
      if (saved) return JSON.parse(saved);
    }
    return {};
  });

  const tasks = building ? TASKS[building] : [];

  // 2. AUTO-SAVE: Simpan data ke Local Storage setiap ada perubahan
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sipbi_daerah", daerah);
      localStorage.setItem("sipbi_building", building);
      localStorage.setItem("sipbi_rows", JSON.stringify(rows));
    }
  }, [daerah, building, rows]);

  const handleChange = (idx: number, field: keyof Row, value: number | "") => {
    setRows((prev) => {
      const cur = prev[idx] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
      return { ...prev, [idx]: { ...cur, [field]: value } };
    });
  };

  const reset = () => {
    setRows({});
    if (typeof window !== "undefined") localStorage.removeItem("sipbi_rows");
  };

  const calculateVolume = (r?: Row) => {
    if (!r) return { vol: 0, unit: "m²" };
    const p = Number(r.panjang) || 0;
    const l = Number(r.lebar) || 0;
    const t = Number(r.tinggi);

    if (t > 0) return { vol: p * l * t, unit: "m³" };
    return { vol: p * l, unit: "m²" };
  };

  const total = useMemo(() => {
    return tasks.reduce((sum, _, i) => {
      const { vol } = calculateVolume(rows[i]);
      const harga = Number(rows[i]?.harga) || 0;
      return sum + vol * harga;
    }, 0);
  }, [rows, tasks]);

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    if (!building) return;
    const data = tasks.map((t, i) => {
      const r = rows[i] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
      const { vol, unit } = calculateVolume(r);
      const harga = Number(r.harga) || 0;
      return {
        No: i + 1,
        "Rincian Pekerjaan": t,
        "Panjang (m)": r.panjang,
        "Lebar (m)": r.lebar,
        "Tinggi (m)": r.tinggi,
        "Satuan": unit,
        "Volume": vol,
        "Harga Satuan": harga,
        "Subtotal": vol * harga,
      };
    });
    
    data.push({
      No: "" as unknown as number,
      "Rincian Pekerjaan": "TOTAL BIAYA PEMELIHARAAN BANGUNAN PELENGKAP IRIGASI",
      "Panjang (m)": "", "Lebar (m)": "", "Tinggi (m)": "", "Satuan": "",
      "Volume": "" as unknown as number, "Harga Satuan": "" as unknown as number,
      "Subtotal": total,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AKNOP");
    const fname = `SIPBI_${(daerah || "DI").replace(/\s+/g, "_")}_${building.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(wb, fname);
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      <Sidebar />

      <main className="flex-1 min-w-0 bg-background/50">
        {/* Tambahan print:hidden agar navbar atas hilang saat di-print */}
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30 print:hidden">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="text-sm text-muted-foreground font-medium">SIPBI / Calculator Hub</div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">← Kembali ke Beranda</Link>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto print:p-0 print:max-w-full">
          <div className="mb-8 print:mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi
            </h1>
            <p className="mt-2 text-muted-foreground print:hidden">
              Hitung estimasi biaya pemeliharaan bangunan pelengkap irigasi berbasis AKNOP secara otomatis.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-8 print:shadow-none print:border-none print:p-0">
            <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Daerah Irigasi</label>
                <input
                  value={daerah}
                  onChange={(e) => setDaerah(e.target.value)}
                  placeholder="Contoh: DI Cikondang"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition print:border-none print:p-0 print:text-base print:font-semibold"
                />
              </div>
              <div className="print:hidden">
                <label className="text-sm font-medium text-foreground">Pilih Bangunan Pelengkap</label>
                <select
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value as BuildingKey);
                  }}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                >
                  <option value="">- Pilih bangunan -</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              {/* Teks statis untuk print PDF agar rapi */}
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
                    Rincian Pekerjaan - {building}
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
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">Panjang (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">Lebar (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-20 border-b print:border-gray-300">Tinggi (ops)</th>
                        <th className="text-center py-3 px-3 font-medium w-24 border-b print:border-gray-300">Volume</th>
                        <th className="text-left py-3 px-3 font-medium w-32 border-b print:border-gray-300">Harga Satuan</th>
                        <th className="text-right py-3 px-4 font-medium w-36 border-b print:border-gray-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => {
                        const r = rows[i];
                        const { vol, unit } = calculateVolume(r);
                        const harga = Number(r?.harga) || 0;
                        const sub = vol * harga;

                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition print:border-gray-300">
                            <td className="py-2 px-3 text-muted-foreground print:text-black">{i + 1}</td>
                            <td className="py-2 px-3 text-foreground font-medium print:text-black">{t}</td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0} value={r?.panjang ?? ""}
                                onChange={(e) => handleChange(i, "panjang", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0} value={r?.lebar ?? ""}
                                onChange={(e) => handleChange(i, "lebar", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0} value={r?.tinggi ?? ""}
                                onChange={(e) => handleChange(i, "tinggi", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="-"
                              />
                            </td>
                            <td className="py-2 px-3 text-center bg-muted/20 print:bg-transparent">
                              <span className="font-semibold text-foreground print:text-black">{vol || "-"}</span>
                              <span className="text-xs text-muted-foreground ml-1 print:text-black">{vol > 0 ? unit : ""}</span>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number" min={0} value={r?.harga ?? ""}
                                onChange={(e) => handleChange(i, "harga", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 print:border-none print:p-0 print:bg-transparent" placeholder="Rp 0"
                              />
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

                {/* Footer Total & Buttons */}
                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-mint border border-border p-6 print:bg-transparent print:border-t-2 print:border-black print:rounded-none print:p-4 print:mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground print:text-black print:font-semibold">Total Biaya Pemeliharaan Bangunan Pelengkap Irigasi</div>
                    <div className="mt-1 text-3xl md:text-4xl font-bold text-foreground tabular-nums print:text-black print:text-2xl">
                      {formatIDR(total)}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-full bg-white border border-input px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak PDF
                    </button>
                    <button
                      onClick={exportExcel}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Export Excel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!building && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground print:hidden">
                Pilih bangunan pelengkap untuk memulai perhitungan.
              </div>
            )}
          </div>
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
    // Menu yang belum dibuat fungsinya kita sembunyikan atau redupkan agar tidak membingungkan
    { to: "#", label: "Analytics", icon: BarChart3, disabled: true },
    { to: "#", label: "Riwayat", icon: History, disabled: true },
  ];
  return (
    // Tambahan print:hidden agar sidebar hilang saat dicetak ke PDF
    <aside className="hidden md:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground flex-col p-6 border-r border-sidebar-border print:hidden">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10 text-primary">
        <span>SIPBI</span>
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
      </Link>
      <nav className="flex flex-col gap-2">
        {items.map((it, i) => {
          const active = it.label === "Calculator Hub" && path === "/calculator";
          return (
            <Link
              key={i}
              to={it.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${it.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
            >
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