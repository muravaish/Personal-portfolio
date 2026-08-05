import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#certifications", label: "Certifications" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          <span className="gradient-text">portfolio</span>.dev
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>
        <Link href="/dashboard" className="btn-primary text-xs">
          Open Command Center
        </Link>
      </nav>
    </header>
  );
}
