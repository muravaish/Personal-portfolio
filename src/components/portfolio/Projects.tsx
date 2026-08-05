import { projects } from "@/data/profile";

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="label mb-6">Projects</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`card flex flex-col gap-3 p-6 ${p.highlight ? "sm:col-span-2 border-accent/30" : ""}`}
          >
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{p.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {p.tags.map((t) => (
                <span key={t} className="badge text-foreground/70">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto flex gap-3 pt-3 text-sm">
              {p.url && (
                <a href={p.url} className="text-accent-2 hover:underline" target="_blank" rel="noreferrer">
                  Live ↗
                </a>
              )}
              {p.repoUrl && (
                <a href={p.repoUrl} className="text-muted hover:text-foreground" target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
