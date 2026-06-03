import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <span className="tracking-tight">SIPBI</span>
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#fitur" className="hover:text-foreground transition">Fitur</a>
          <a href="/#cara-kerja" className="hover:text-foreground transition">Perhitungan</a>
          <a href="/#aknop" className="hover:text-foreground transition">AKNOP</a>
          <a href="/#docs" className="hover:text-foreground transition">Dokumentasi</a>
        </nav>
        <Link
          to="/calculator"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-glow transition-all"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
