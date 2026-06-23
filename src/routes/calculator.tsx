import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Save, Plus, Trash2, Printer, Menu, ChevronDown } from "lucide-react";
import { BUILDINGS, TASKS, formatIDR, getAhspPrice, type BuildingKey } from "@/lib/aknop";
import { exportRAB } from "@/lib/exportExcel";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";

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

type Row = {
  bentuk?: string;
  panjang: number | "";
  lebar: number | "";
  tinggi: number | "";
  lebarAtas: number | "";
  lebarBawah: number | "";
  diameter: number | "";
  diameterLuar: number | "";
  diameterDalam: number | "";
  diameterBesi: number | "";
  volumeManual?: number | "";
  harga: number | "";
};

export const getKategoriBiaya = (total: number) => {
  if (total > 50000000) return { label: "Rehabilitasi Berat", color: "bg-destructive text-destructive-foreground" };
  if (total >= 15000000) return { label: "Pemeliharaan Sedang", color: "bg-amber-500 text-white" };
  if (total > 0) return { label: "Pemeliharaan Ringan", color: "bg-primary text-primary-foreground" };
  return { label: "-", color: "bg-muted text-muted-foreground" };
};

function CalculatorPage() {
  const search = Route.useSearch();
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

  const handleChange = (idx: number, field: keyof Row, value: string | number) => {
    if (typeof value === 'number' && value < 0) return;
    setRows((prev) => {
      const cur = prev[idx] ?? { 
        bentuk: "Balok", panjang: "", lebar: "", tinggi: "", 
        lebarAtas: "", lebarBawah: "", diameter: "", diameterLuar: "", 
        diameterDalam: "", diameterBesi: "", volumeManual: "", harga: "" 
      };
      return { ...prev, [idx]: { ...cur, [field]: value } };
    });
  };

  const reset = () => {
    setRows({});
    if (typeof window !== "undefined") localStorage.removeItem("iricost_rows");
    toast.info("Angka perhitungan telah direset.");
  };

  const calculateVolume = (taskName: string, r?: Row) => {
    if (!r) return { vol: 0, unit: "m³", isDiscounted: false };
    
    const bentuk = r.bentuk || "Balok";
    const P = Number(r.panjang) || 0;
    const L = Number(r.lebar) || 0;
    const T = Number(r.tinggi) || 0;
    const La = Number(r.lebarAtas) || 0;
    const Lb = Number(r.lebarBawah) || 0;
    const D = Number(r.diameter) || 0;
    const D1 = Number(r.diameterLuar) || 0;
    const D2 = Number(r.diameterDalam) || 0;
    const dBesi = Number(r.diameterBesi) || 0;

    let vol = 0;
    let unit = "m³";

    switch (bentuk) {
      case "Prisma":
        vol = 0.5 * P * L * T;
        break;
      case "Trapesium":
        vol = ((La + Lb) / 2) * T * P;
        break;
      case "Segitiga":
        vol = 0.5 * L * T * P;
        break;
      case "Silinder":
        vol = 0.25 * Math.PI * Math.pow(D, 2) * T;
        break;
      case "Tabung Berongga":
        vol = 0.25 * Math.PI * (Math.pow(D1, 2) - Math.pow(D2, 2)) * P;
        break;
      case "Luas Persegi":
      case "Luas Permukaan":
        vol = P * L;
        unit = "m²";
        break;
      case "Luas Trapesium":
        vol = ((La + Lb) / 2) * T;
        unit = "m²";
        break;
      case "Berat Besi":
        vol = 0.006165 * Math.pow(dBesi, 2) * P;
        unit = "kg";
        break;
      case "Manual":
        vol = Number(r.volumeManual) || 0;
        unit = "ls";
        break;
      case "Balok":
      default:
        vol = P * L * T;
        break;
    }

    let isDiscounted = false;
    const taskLower = taskName.toLowerCase();
    if (taskLower.includes("bongkar") || taskLower.includes("pembongkaran")) {
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

      const newHistory = {
        id: new Date().getTime(),
        tanggal: new Date().toLocaleString("id-ID"),
        daerah,
        nomenklatur,
        building,
        total,
        rows,
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

  // Komponen Input Dimensi yang distandarisasi ukurannya
  const InputCell = ({ idx, field, label }: { idx: number, field: keyof Row, label: string }) => (
    <div className="flex flex-col gap-1 w-28 shrink-0">
      <label className="text-[10px] text-muted-foreground font-medium truncate">{label}</label>
      <input 
        type="number" min="0" onKeyDown={preventMinus} 
        value={(rows[idx]?.[field] as number) ?? ""} 
        onChange={(e) => handleChange(idx, field, e.target.value ? Number(e.target.value) : "")} 
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30 transition-all" 
        placeholder="0" 
      />
    </div>
  );

  return (
    <div className="h-screen flex bg-gradient-hero overflow-hidden">
      <Toaster position="top-right" richColors />
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 min-w-0 bg-background/50 transition-all duration-300 overflow-y-auto relative">
        <div className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30 print:hidden">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 -ml-1.5 hover:bg-muted rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <Menu className="h-5 w-5" />
              </button>
              <span>IriCost / Calculator Hub</span>
            </div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">← Kembali ke Beranda</Link>
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto print:p-0 print:max-w-full">
          <div className="mb-8 print:mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi</h1>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-6 md:p-8 print:shadow-none print:border-none print:p-0">
            <div className="grid md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Daerah Irigasi</label>
                <input value={daerah} onChange={(e) => setDaerah(e.target.value)} placeholder="Contoh: DI Cikondang" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Nomenklatur Bangunan</label>
                <input value={nomenklatur} onChange={(e) => setNomenklatur(e.target.value)} placeholder="Contoh: B.G. 1" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
              </div>
              <div className="print:hidden">
                <label className="text-sm font-medium text-foreground">Pilih Bangunan Pelengkap</label>
                <select value={building} onChange={(e) => setBuilding(e.target.value as BuildingKey)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                  <option value="">- Pilih bangunan -</option>
                  {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
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
                        <th className="text-left py-3 px-4 font-medium w-12 border-b">No</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[220px] border-b">Rincian Pekerjaan</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[500px] border-b">Parameter Dimensi</th>
                        <th className="text-center py-3 px-4 font-medium w-36 border-b">Volume</th>
                        <th className="text-left py-3 px-4 font-medium w-36 border-b">Harga Satuan</th>
                        <th className="text-right py-3 px-5 font-medium w-36 border-b">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => {
                        const r = rows[i];
                        const { vol, unit, isDiscounted } = calculateVolume(t, r);
                        const ahspPrice = getAhspPrice(t);
                        const harga = ahspPrice > 0 ? ahspPrice : (Number(r?.harga) || 0);
                        const sub = vol * harga;
                        const bentuk = r?.bentuk || "Balok";

                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition print:border-gray-300">
                            <td className="py-4 px-4 text-muted-foreground align-top pt-5">{i + 1}</td>
                            
                            <td className="py-4 px-4 text-foreground font-medium align-top pt-4">
                              <div className="leading-snug">{t}</div>
                              <div className="relative inline-flex mt-2 print:hidden w-36">
                                <select 
                                  value={bentuk} 
                                  onChange={(e) => handleChange(i, "bentuk", e.target.value)}
                                  className="w-full appearance-none bg-white border border-border text-muted-foreground hover:text-foreground transition-colors text-[11px] font-medium py-1.5 pl-2.5 pr-7 rounded-md outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-sm"
                                >
                                  <option value="Balok">Balok</option>
                                  <option value="Prisma">Prisma</option>
                                  <option value="Trapesium">Trapesium</option>
                                  <option value="Segitiga">Segitiga</option>
                                  <option value="Silinder">Silinder</option>
                                  <option value="Tabung Berongga">Tb. Berongga</option>
                                  <option value="Luas Persegi">Luas Persegi</option>
                                  <option value="Luas Trapesium">Luas Trapesium</option>
                                  <option value="Luas Permukaan">Luas Permukaan</option>
                                  <option value="Berat Besi">Berat Besi</option>
                                  <option value="Manual">Lumpsum (Manual)</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                              </div>
                              {isDiscounted && <div className="text-[9px] text-amber-500 font-semibold mt-1.5">*Vol otomatis × 20%</div>}
                            </td>
                            
                            {/* KOLOM PARAMETER DIMENSI */}
                            <td className="py-4 px-4 align-top pt-4">
                              <div className="flex flex-wrap gap-3">
                                {(bentuk === "Balok" || bentuk === "Prisma" || bentuk === "Segitiga") && (
                                  <><InputCell idx={i} field="panjang" label="P (m)" /><InputCell idx={i} field="lebar" label="L (m)" /><InputCell idx={i} field="tinggi" label="T (m)" /></>
                                )}
                                {bentuk === "Trapesium" && (
                                  <><InputCell idx={i} field="panjang" label="P (m)" /><InputCell idx={i} field="lebarAtas" label="L.Atas (m)" /><InputCell idx={i} field="lebarBawah" label="L.Bwh (m)" /><InputCell idx={i} field="tinggi" label="T (m)" /></>
                                )}
                                {bentuk === "Silinder" && (
                                  <><InputCell idx={i} field="diameter" label="Dia (m)" /><InputCell idx={i} field="tinggi" label="T (m)" /></>
                                )}
                                {bentuk === "Tabung Berongga" && (
                                  <><InputCell idx={i} field="panjang" label="P (m)" /><InputCell idx={i} field="diameterLuar" label="Dia.Luar (m)" /><InputCell idx={i} field="diameterDalam" label="Dia.Dlm (m)" /></>
                                )}
                                {(bentuk === "Luas Persegi" || bentuk === "Luas Permukaan") && (
                                  <><InputCell idx={i} field="panjang" label="P (m)" /><InputCell idx={i} field="lebar" label="L (m)" /></>
                                )}
                                {bentuk === "Luas Trapesium" && (
                                  <><InputCell idx={i} field="lebarAtas" label="L.Atas (m)" /><InputCell idx={i} field="lebarBawah" label="L.Bwh (m)" /><InputCell idx={i} field="tinggi" label="T (m)" /></>
                                )}
                                {bentuk === "Berat Besi" && (
                                  <><InputCell idx={i} field="panjang" label="P.Total (m)" /><InputCell idx={i} field="diameterBesi" label="Dia.Besi(mm)" /></>
                                )}
                                {bentuk === "Manual" && (
                                  <div className="text-xs text-muted-foreground/70 italic py-2 flex items-center h-9 mt-4">
                                    Input angka langsung di kolom volume →
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* OUTPUT / MANUAL VOLUME DENGAN SPACER LABEL */}
                            <td className="py-4 px-4 text-center bg-muted/10 align-top pt-4">
                              <div className="flex flex-col gap-1 w-28 mx-auto shrink-0">
                                <label className="text-[10px] opacity-0 select-none block">Spacer</label>
                                {bentuk === "Manual" ? (
                                  <input 
                                    type="number" min="0" onKeyDown={preventMinus} 
                                    value={r?.volumeManual ?? ""} 
                                    onChange={(e) => handleChange(i, "volumeManual", e.target.value ? Number(e.target.value) : "")} 
                                    className="w-full h-9 rounded-md border border-primary bg-background px-2 py-1 text-xs text-center outline-none focus:ring-2 focus:ring-primary/40 shadow-sm" 
                                    placeholder="Isi Vol" 
                                  />
                                ) : (
                                  <div className="w-full h-9 flex items-center justify-center">
                                    <span className="font-semibold text-foreground text-sm print:text-black">{vol || "-"}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium ml-1 print:text-black">{vol > 0 ? unit : ""}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* HARGA SATUAN DENGAN UKURAN PERSIS SAMA (w-28, h-9) */}
                            <td className="py-4 px-4 align-top pt-4">
                              <div className="flex flex-col gap-1 w-28 shrink-0">
                                <label className="text-[10px] opacity-0 select-none block">Spacer</label>
                                {ahspPrice > 0 ? (
                                  <div className="w-full h-9 flex items-center px-3 text-xs font-semibold text-primary bg-primary/5 rounded-md border border-primary/20 print:border-none print:bg-transparent print:p-0 print:text-black">
                                    {formatIDR(ahspPrice)}
                                  </div>
                                ) : (
                                  <input 
                                    type="number" min="0" onKeyDown={preventMinus} 
                                    value={r?.harga ?? ""} 
                                    onChange={(e) => handleChange(i, "harga", e.target.value ? Number(e.target.value) : "")} 
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/40" 
                                    placeholder="Rp 0" 
                                  />
                                )}
                              </div>
                            </td>

                            {/* SUBTOTAL DENGAN SPACER LABEL */}
                            <td className="py-4 px-5 text-right align-top pt-4">
                              <div className="flex flex-col gap-1 w-full shrink-0">
                                <label className="text-[10px] opacity-0 select-none block">Spacer</label>
                                <div className="w-full h-9 flex items-center justify-end font-bold text-foreground tabular-nums print:text-black">
                                  {formatIDR(sub)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-mint border border-border p-6 print:bg-transparent print:border-t-2 print:border-black print:rounded-none">
                  <div>
                    <div className="text-sm text-muted-foreground print:text-black print:font-semibold">Total Biaya Pemeliharaan</div>
                    <div className="mt-1 text-3xl md:text-4xl font-bold text-foreground tabular-nums print:text-black print:text-2xl">{formatIDR(total)}</div>
                    {total > 0 && <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${kategori.color} print:bg-transparent print:text-black print:border print:border-black`}>Kategori Penanganan: {kategori.label}</div>}
                  </div>
                  <div className="flex gap-3 print:hidden">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white border border-input px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted"><Printer className="h-4 w-4" /> Cetak PDF</button>
                    <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow"><Save className="h-4 w-4" /> Export Excel</button>
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