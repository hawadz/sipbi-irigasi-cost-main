import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, FileSpreadsheet, Zap, ArrowRight, Droplets, TrendingUp, Database, CheckCircle2, Clock, ShieldCheck, FileCheck } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IriCost - Aplikasi Perhitungan RAB Irigasi" },
      { name: "description", content: "Aplikasi perhitungan biaya pemeliharaan irigasi." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [daerah, setDaerah] = useState("");
  const navigate = useNavigate();

  const start = () => {
    navigate({ to: "/calculator", search: { daerah } as never });
  };

  const DAFTAR_BANGUNAN = [
    "Bangunan Gorong - Gorong", "Bangunan Terjun", "Jembatan Saluran", "Talang",
    "Bangunan Pelimpah", "Bangunan Pembuang", "Bangunan Pembilas", "Bangunan Penahan",
    "Syphone", "Terowongan", "Cross Drain", "Pelimpah Samping", "Drain Inlet", "Got Miring"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteNav />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.07_155)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Aplikasi Perhitungan RAB Bangunan Pelengkap <span className="text-primary">Irigasi.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Hitung estimasi biaya pemeliharaan irigasi dengan lebih cepat. Dilengkapi perhitungan volume otomatis dan integrasi harga AHSP.
            </p>

            <div className="mt-10 flex items-center gap-2 rounded-full bg-card border border-border p-2 pl-6 shadow-soft max-w-xl">
              <Droplets className="h-5 w-5 text-primary shrink-0" />
              <input
                value={daerah}
                onChange={(e) => setDaerah(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="Masukkan nama daerah irigasi..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground py-2"
              />
              <button
                onClick={start}
                className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:shadow-glow transition-all flex items-center gap-1"
              >
                Mulai Hitung <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* GLASS CARD MOCKUP */}
          <div className="relative h-[420px]">
            <div className="absolute inset-0 bg-gradient-mint rounded-3xl border border-border shadow-glow" />
            <div className="absolute top-8 right-8 left-8 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/60 shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contoh Estimasi RAB</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">Rp 152.865.281</div>
              <div className="text-xs text-primary mt-1 font-medium bg-primary/10 inline-block px-2 py-0.5 rounded">Pemeliharaan Sedang</div>
              <div className="mt-6 space-y-3">
                {[
                  ["Galian Tanah Biasa", "Rp 1.400.000"],
                  ["Pasangan Batu 1 PC : 4 PS", "Rp 141.221.610"],
                  ["Siaran dengan mortar", "Rp 8.026.200"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground truncate pr-4">{k}</span>
                    <span className="text-foreground font-medium shrink-0">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AHSP Badge */}
            <div className="absolute bottom-8 left-12 right-12 bg-card rounded-2xl border border-border shadow-soft p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Database AHSP</div>
                <div className="text-xs text-muted-foreground">Harga satuan terkunci otomatis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAKUPAN BANGUNAN SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="bg-card rounded-3xl border border-border shadow-soft p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4">
            Mendukung <span className="text-primary">14 Jenis</span> Bangunan Pelengkap
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Sistem telah dilengkapi dengan formulasi dan rincian pekerjaan standar yang disesuaikan dengan setiap jenis bangunan pelengkap irigasi.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {DAFTAR_BANGUNAN.map((bangunan) => (
              <span key={bangunan} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground shadow-sm hover:border-primary/50 transition-colors cursor-default">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {bangunan}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION: KEUNGGULAN SISTEM */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Keunggulan Sistem <span className="text-primary">IriCost</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Dirancang untuk mengatasi kendala perhitungan manual dan mempercepat proses penyusunan Rencana Anggaran Biaya.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: "Efisiensi Waktu", desc: "Mempercepat proses pembuatan RAB dibandingkan dengan menggunakan spreadsheet manual." },
            { icon: ShieldCheck, title: "Akurasi Data", desc: "Meminimalisir human error dalam menghitung rumus volume maupun input harga satuan." },
            { icon: FileCheck, title: "Sesuai Standar", desc: "Format tabel Excel (.xlsx) yang diexport sudah disesuaikan dengan standar dokumen resmi Dinas PU." },
            { icon: Droplets, title: "Praktis & Mudah", desc: "Sistem didesain khusus agar mudah digunakan dengan tampilan antarmuka yang bersih dan intuitif." },
          ].map((item, idx) => (
            <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-soft transition-all text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center mb-5">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="cara-kerja" className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground max-w-2xl tracking-tight">
          Cara Menggunakan <span className="text-primary">Aplikasi</span>
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            ["01", "Pilih Bangunan", "Masukkan nama Daerah Irigasi, Nomenklatur, dan pilih jenis bangunan pelengkap yang mau dihitung."],
            ["02", "Input Ukuran", "Masukkan angka panjang, lebar, dan tinggi pekerjaan di kolom yang tersedia."],
            ["03", "Download RAB", "Klik tombol export untuk mendapatkan file Excel Rencana Anggaran Biaya (RAB)."],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-sidebar text-sidebar-foreground rounded-2xl p-8 shadow-soft">
              <div className="text-sidebar-primary text-sm font-mono">{n}</div>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-3 text-sidebar-foreground/70 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SIMPLE CTA SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-10 md:p-14">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Siap mencoba aplikasinya?</h2>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
          >
            Buka Kalkulator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground flex flex-col gap-2">
        <p>© 2026 IriCost - Analisis Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi</p>
        <p className="text-xs opacity-70">Program Studi Teknik Sipil - Universitas Muhammadiyah Sukabumi</p>
      </footer>
    </div>
  );
}