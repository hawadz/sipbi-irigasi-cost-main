import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutDashboard, BarChart3, Calculator as CalcIcon, History, Save, Plus, Trash2 } from "lucide-react";
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

// Tipe data diubah untuk menampung panjang, lebar, dan tinggi
type Row = { panjang: number | ""; lebar: number | ""; tinggi: number | ""; harga: number | "" };

function CalculatorPage() {
  const search = Route.useSearch();
  const [daerah, setDaerah] = useState(search.daerah ?? "");
  const [building, setBuilding] = useState<BuildingKey | "">("");
  const [rows, setRows] = useState<Record<string, Row>>({});

  const tasks = building ? TASKS[building] : [];

  const handleChange = (idx: number, field: keyof Row, value: number | "") => {
    setRows((prev) => {
      const cur = prev[idx] ?? { panjang: "", lebar: "", tinggi: "", harga: "" };
      return { ...prev, [idx]: { ...cur, [field]: value } };
    });
  };

  const reset = () => {
    setRows({});
  };

  // Fungsi helper untuk menghitung volume dinamis
  const calculateVolume = (r?: Row) => {
    if (!r) return { vol: 0, unit: "m²" };
    const p = Number(r.panjang) || 0;
    const l = Number(r.lebar) || 0;
    const t = Number(r.tinggi);

    if (t > 0) {
      return { vol: p * l * t, unit: "m³" }; // Kalau ada tinggi, jadi m3
    }
    return { vol: p * l, unit: "m²" }; // Kalau tidak ada tinggi, default m2
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
    
    // Baris total
    data.push({
      No: "" as unknown as number,
      "Rincian Pekerjaan": "TOTAL BIAYA PEMELIHARAAN BANGUNAN PELENGKAP IRIGASI",
      "Panjang (m)": "",
      "Lebar (m)": "",
      "Tinggi (m)": "",
      "Satuan": "",
      "Volume": "" as unknown as number,
      "Harga Satuan": "" as unknown as number,
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

      <main className="flex-1 min-w-0">
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">SIPBI / Calculator Hub</div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">← Beranda</Link>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi
            </h1>
            <p className="mt-2 text-muted-foreground">
              Hitung estimasi biaya pemeliharaan bangunan pelengkap irigasi berbasis AKNOP.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground">Daerah Irigasi</label>
                <input
                  value={daerah}
                  onChange={(e) => setDaerah(e.target.value)}
                  placeholder="Contoh: DI Cikondang"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pilih Bangunan Pelengkap</label>
                <select
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value as BuildingKey);
                    reset();
                  }}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                >
                  <option value="">- Pilih bangunan -</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {building && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Rincian Pekerjaan - {building}
                  </h2>
                  <button onClick={reset} className="text-sm text-muted-foreground hover:text-destructive transition flex items-center gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left py-3 px-3 font-medium w-10">No</th>
                        <th className="text-left py-3 px-3 font-medium min-w-[200px]">Rincian Pekerjaan</th>
                        <th className="text-left py-3 px-2 font-medium w-24">Panjang (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-24">Lebar (m)</th>
                        <th className="text-left py-3 px-2 font-medium w-24">Tinggi (m)</th>
                        <th className="text-center py-3 px-3 font-medium w-28">Volume</th>
                        <th className="text-left py-3 px-3 font-medium w-36">Harga Satuan</th>
                        <th className="text-right py-3 px-4 font-medium w-40">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => {
                        const r = rows[i];
                        const { vol, unit } = calculateVolume(r);
                        const harga = Number(r?.harga) || 0;
                        const sub = vol * harga;

                        return (
                          <tr key={i} className="border-t border-border hover:bg-muted/30 transition">
                            <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 px-3 text-foreground font-medium">{t}</td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0}
                                value={r?.panjang ?? ""}
                                onChange={(e) => handleChange(i, "panjang", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-lg border border-input bg-background px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0}
                                value={r?.lebar ?? ""}
                                onChange={(e) => handleChange(i, "lebar", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-lg border border-input bg-background px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number" min={0}
                                value={r?.tinggi ?? ""}
                                onChange={(e) => handleChange(i, "tinggi", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-lg border border-input bg-background px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/40"
                                placeholder="-"
                              />
                            </td>
                            <td className="py-2 px-3 text-center bg-muted/20">
                              <span className="font-semibold text-foreground">{vol || 0}</span>
                              <span className="text-xs text-muted-foreground ml-1">{vol > 0 ? unit : ""}</span>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number" min={0}
                                value={r?.harga ?? ""}
                                onChange={(e) => handleChange(i, "harga", e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                                placeholder="Rp 0"
                              />
                            </td>
                            <td className="py-2 px-4 text-right font-bold text-foreground tabular-nums">
                              {formatIDR(sub)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-mint border border-border p-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Biaya Pemeliharaan Bangunan Pelengkap Irigasi</div>
                    <div className="mt-1 text-3xl md:text-4xl font-bold text-foreground tabular-nums">
                      {formatIDR(total)}
                    </div>
                  </div>
                  <button
                    onClick={exportExcel}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Simpan & Export Excel
                  </button>
                </div>
              </div>
            )}

            {!building && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
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
    { to: "/calculator", label: "Analytics", icon: BarChart3, disabled: true },
    { to: "/calculator", label: "Calculator Hub", icon: CalcIcon },
    { to: "/calculator", label: "Riwayat", icon: History, disabled: true },
  ];
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground flex-col p-6 border-r border-sidebar-border">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-10">
        <span>SIPBI</span>
        <span className="h-2 w-2 rounded-full bg-sidebar-primary shadow-[0_0_12px_var(--sidebar-primary)]" />
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map((it, i) => {
          const active = it.label === "Calculator Hub" && path === "/calculator";
          return (
            <Link
              key={i}
              to={it.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${it.disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-sidebar-accent p-4 text-xs text-sidebar-foreground/80">
        <div className="font-semibold text-sidebar-foreground mb-1">Berbasis AKNOP</div>
        Standar resmi perhitungan biaya operasional & pemeliharaan irigasi.
      </div>
    </aside>
  );
}