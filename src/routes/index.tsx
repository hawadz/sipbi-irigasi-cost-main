import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, FileSpreadsheet, Zap, ArrowRight, Droplets, CheckCircle2, Clock, ShieldCheck, FileCheck } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteNav />

      {/* PREMIUM HERO SECTION WITH SEAMLESS BLENDED BACKGROUND */}
      <section className="relative w-full min-h-[600px] md:min-h-[680px] flex items-center justify-center pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-irigasi.jpeg" 
            alt="Latar Belakang Irigasi" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl">
            Aplikasi Perhitungan Bangunan Pelengkap <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Irigasi.</span>
          </h1>
          
          <p className="mt-6 text-base md:text-xl text-slate-200 max-w-2xl leading-relaxed font-light">
            Otomatisasi kalkulasi volume pemeliharaan irigasi berbasis data AHSP. Dirancang untuk hasil laporan yang presisi, cepat, dan terstandarisasi.
          </p>

          <div className="mt-10 w-full max-w-xl mx-auto p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl flex items-center gap-2 focus-within:border-primary/50 focus-within:bg-black/40 transition-all">
            <div className="flex items-center gap-2 flex-1 pl-4">
              <Droplets className="h-5 w-5 text-emerald-400 shrink-0" />
              <input
                value={daerah}
                onChange={(e) => setDaerah(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="Masukkan nama daerah irigasi..."
                className="w-full bg-transparent outline-none text-sm md:text-base text-white placeholder:text-slate-300 py-2"
              />
            </div>
            <button
              onClick={start}
              className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:shadow-glow hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0"
            >
              Mulai Hitung <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CAKUPAN BANGUNAN SECTION */}
      <section className="mx-auto max-w-7xl px-6 pb-16 -mt-16 relative z-20">
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-12 text-center backdrop-blur-md">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            Mendukung <span className="text-primary">14 Jenis</span> Bangunan Pelengkap
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-sm md:text-base">
            Sistem mengadopsi rincian pekerjaan dan perhitungan dimensi otomatis yang disesuaikan untuk setiap jenis aset bangunan.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {DAFTAR_BANGUNAN.map((bangunan) => (
              <span key={bangunan} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border/80 text-xs md:text-sm font-medium text-foreground shadow-sm hover:border-primary/40 transition-all cursor-default">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {bangunan}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN SISTEM */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Keunggulan Sistem <span className="text-primary">IriCost</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Solusi digital modern untuk menggantikan konformitas perhitungan spreadsheet manual demi efisiensi instansi.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: "Efisiensi Waktu", desc: "Pemotongan waktu penyusunan anggaran biaya hingga 80% dibanding hitungan manual." },
            { icon: ShieldCheck, title: "Akurasi Data", desc: "Validasi otomatis mengeliminasi kesalahan rumus volume silang maupun harga satuan." },
            { icon: FileCheck, title: "Sesuai Standar", desc: "Format berkas hasil export (.xlsx) telah disesuaikan dengan struktur resmi Dinas Pekerjaan Umum." },
            { icon: Droplets, title: "Praktis & Mudah", desc: "Antarmuka alur kerja yang minimalis, memudahkan operator lapangan tanpa pelatihan rumit." },
          ].map((item, idx) => (
            <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-5 shrink-0">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION (UPGRADED SAAS STYLE) */}
      <section id="cara-kerja" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.96_0.02_155)_0%,transparent_70%)] opacity-50" />
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Alur Kerja <span className="text-primary">Sistem</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
            Tiga langkah mudah untuk mendapatkan dokumen Rencana Anggaran Biaya yang akurat dan siap cetak.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Garis penghubung background (hanya terlihat di layar besar) */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

          {[
            { step: "01", title: "Pilih Jenis Bangunan", desc: "Definisikan lokasi Daerah Irigasi, input Nomenklatur, dan tentukan klasifikasi bangunan pelengkap." },
            { step: "02", title: "Input Dimensi Fisik", desc: "Masukkan ukuran panjang, lebar, dan tinggi lapangan. Sistem otomatis menentukan konversi volume m² atau m³." },
            { step: "03", title: "Unduh Dokumen RAB", desc: "Satu klik untuk mengunduh laporan analisis rencana anggaran biaya format Excel resmi." },
          ].map((item, idx) => (
            <div key={item.step} className="relative bg-card rounded-3xl border border-border p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              {/* Angka Dekoratif Besar di Latar Belakang Card */}
              <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none leading-none">
                {item.step}
              </div>
              
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6 shadow-md shadow-primary/20 relative z-10">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION (PREMIUM DARK MODE) */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 px-8 py-20 md:py-24 text-center shadow-2xl">
          {/* Efek Glow Dekoratif di Belakang Kotak Gelap */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Siap Melakukan Perhitungan Biaya?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Masuk ke ruang kerja kalkulator sekarang untuk memulai penyusunan analisis harga satuan irigasi dengan cepat dan presisi.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-10 py-4 text-base font-bold text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.6)] transition-all duration-300"
            >
              Buka Kalkulator RAB <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-xs md:text-sm text-muted-foreground flex flex-col gap-1.5 border-t border-border/40">
        <p>© 2026 IriCost - Analisis Perhitungan Biaya Pemeliharaan Bangunan Pelengkap Irigasi</p>
      </footer>
    </div>
  );
}