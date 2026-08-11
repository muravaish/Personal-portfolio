import { skillCategories } from "@/data/profile";
import { TechIcon } from "./TechIcon";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="label mb-6">Skills</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((cat) => (
          <div key={cat.label} className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground/90">{cat.label}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((s) => (
                <span key={s} className="badge gap-1.5 text-foreground/80">
                  <TechIcon name={s} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
