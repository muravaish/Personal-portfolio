import { projects, type Project } from "@/data/profile";

function ProjectBody({ p }: { p: Project }) {
  return (
    <>
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
    </>
  );
}

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="label mb-6">Projects</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) =>
          p.videoUrl ? (
            <div
              key={p.id}
              className={`card flex flex-col gap-4 overflow-hidden p-6 sm:flex-row ${p.highlight ? "sm:col-span-2 border-accent/30" : ""}`}
            >
              <video
                src={p.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-video w-full shrink-0 rounded-lg object-cover sm:w-64"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <ProjectBody p={p} />
              </div>
            </div>
          ) : (
            <div
              key={p.id}
              className={`card flex flex-col gap-3 overflow-hidden p-6 ${p.highlight ? "sm:col-span-2 border-accent/30" : ""}`}
            >
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={`${p.title} preview`}
                  className="-m-6 mb-0 aspect-video w-[calc(100%+3rem)] object-cover object-top"
                />
              )}
              <ProjectBody p={p} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
