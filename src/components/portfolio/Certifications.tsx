import { certifications } from "@/data/profile";

export function Certifications() {
  if (!certifications.length) return null;

  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="label mb-6">Certifications</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c) => (
          <a
            key={c.id}
            href={c.url || undefined}
            target={c.url ? "_blank" : undefined}
            rel={c.url ? "noreferrer" : undefined}
            className={`card flex flex-col gap-1 p-5 ${c.url ? "transition-transform hover:-translate-y-0.5" : ""}`}
          >
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <p className="text-xs text-muted">
              {c.issuer} · {c.date}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
