import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Trash2, Clock, Menu, Download } from "lucide-react";
import { formatIDR, TASKS, getAhspPrice, type BuildingKey } from "@/lib/aknop";
import { getKategoriBiaya } from "./calculator";
import { exportRAB } from "@/lib/exportExcel";
import { Sidebar } from "@/components/Sidebar";

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
    <div className="h-screen flex bg-gradient-hero overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      
      <main className="flex-1 min-w-0 bg-background/50 transition-all duration-300 overflow-y-auto relative">
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
              <span>IriCost / Riwayat</span>
            </div>
            <Link to="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition">Ke Calculator Hub →</Link>
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">Riwayat Perhitungan</h1>
          
          {history.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-16 flex flex-col items-center justify-center text-center shadow-soft">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Riwayat Kosong</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Belum ada riwayat perhitungan. Silakan lakukan perhitungan di Calculator Hub terlebih dahulu.</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="py-4 px-6 text-left border-b font-medium">Tanggal</th>
                      <th className="py-4 px-6 text-left border-b font-medium">Daerah / Nomenklatur</th>
                      <th className="py-4 px-6 text-left border-b font-medium">Bangunan</th>
                      <th className="py-4 px-6 text-right border-b font-medium">Total Biaya</th>
                      <th className="py-4 px-6 text-center border-b font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-border hover:bg-muted/30 transition">
                        <td className="py-4 px-6 text-muted-foreground">{h.tanggal}</td>
                        <td className="py-4 px-6 font-medium text-foreground">{h.daerah || "-"} / {h.nomenklatur || "-"}</td>
                        <td className="py-4 px-6 text-foreground">{h.building}</td>
                        <td className="py-4 px-6 text-right font-bold text-foreground">{formatIDR(h.total)}</td>
                        <td className="py-4 px-6 flex justify-center gap-2">
                          <button onClick={() => downloadUlang(h)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition" title="Download Excel">
                            <Download className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(h.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition" title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
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