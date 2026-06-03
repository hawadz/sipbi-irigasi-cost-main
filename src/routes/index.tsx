import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, BarChart3, FileText, ArrowRight, Sparkles, Droplets, TrendingUp } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIPBI - Sistem Informasi Perhitungan Biaya Irigasi" },
      { name: "description", content: "Kelola biaya pemeliharaan irigasi secara profesional dengan SIPBI, berbasis AKNOP." },
      { property: "og:title", content: "SIPBI - Perhitungan Biaya Pemeliharaan Irigasi" },
      { property: "og:description", content: "Sistem perhitungan biaya bangunan pelengkap irigasi yang cepat, akurat, dan terstruktur." },
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.07_155)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3 w-3" /> Berbasis AKNOP 2024
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
              Kelola biaya pemeliharaan bangunan pelengkap irigasi secara{" "}
              <span className="italic font-light text-primary">profesional.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Sistem informasi perhitungan biaya bangunan pelengkap irigasi berbasis AKNOP yang cepat, akurat, dan terstruktur.
            </p>

            <div className="mt-10 flex items-center gap-2 rounded-full bg-card border border-border p-2 pl-6 shadow-soft max-w-xl">
              <Droplets className="h-5 w-5 text-primary shrink-0" />
              <input
                value={daerah}
                onChange={(e) => setDaerah(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="Masukkan nama daerah irigasi"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground py-2"
              />
              <button
                onClick={start}
                className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:shadow-glow transition-all flex items-center gap-1"
              >
                Mulai <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Glass card mockup */}
          <div className="relative h-[420px]">
            <div className="absolute inset-0 bg-gradient-mint rounded-3xl border border-border shadow-glow" />
            <div className="absolute top-8 right-8 left-8 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/60 shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Estimasi</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">Rp 1.876.580</div>
              <div className="text-xs text-primary mt-1">+12% efisien dari tahun lalu</div>
              <div className="mt-6 space-y-3">
                {[
                  ["Gorong-gorong", "Rp 642.300"],
                  ["Talang", "Rp 489.120"],
                  ["Jembatan Saluran", "Rp 745.160"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-8 left-12 right-12 bg-card rounded-2xl border border-border shadow-soft p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">IKSI: 86 / Baik</div>
                <div className="text-xs text-muted-foreground">Indeks Kinerja Sistem Irigasi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fitur" className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground max-w-3xl tracking-tight">
          Sistem yang berkembang sesuai{" "}
          <span className="italic font-light text-primary">kebutuhan irigasi.</span>
        </h2>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Calculator, t: "Perhitungan Otomatis", d: "Hitung biaya berdasarkan volume pekerjaan dan harga satuan secara instan." },
            { icon: BarChart3, t: "Indeks Kinerja", d: "Evaluasi kondisi bangunan berdasarkan kategori IKSI secara terstruktur." },
            { icon: FileText, t: "Rekap AKNOP", d: "Laporan biaya lengkap untuk perencanaan anggaran tahunan." },
          ].map((f) => (
            <div key={f.t} className="bg-card rounded-2xl border border-border p-8 shadow-soft hover:shadow-glow transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-6">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{f.t}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground max-w-3xl tracking-tight">
          Optimalkan perencanaan{" "}
          <span className="italic font-light text-primary">anggaran pemeliharaan irigasi.</span>
        </h2>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            ["01", "Input Data Irigasi", "Masukkan data daerah irigasi dan bangunan pelengkap."],
            ["02", "Proses Perhitungan", "Sistem menghitung estimasi biaya berdasarkan AKNOP."],
            ["03", "Unduh Laporan", "Dapatkan rekap biaya untuk anggaran tahunan."],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-sidebar text-sidebar-foreground rounded-2xl p-8 shadow-soft">
              <div className="text-sidebar-primary text-sm font-mono">{n}</div>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-3 text-sidebar-foreground/70 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-mint border border-border p-12 md:p-20 text-center shadow-glow">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,oklch(0.85_0.12_158_/_0.3)_0%,transparent_70%)]" />
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight max-w-3xl mx-auto">
            Siap meningkatkan perencanaan anggaran irigasi?
          </h2>
          <Link
            to="/calculator"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
          >
            Mulai Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © 2026 SIPBI - Sistem Informasi Perhitungan Biaya Irigasi
      </footer>
    </div>
  );
}
