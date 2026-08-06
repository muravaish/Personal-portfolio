import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <div className="card flex flex-col items-start gap-4 p-8 sm:p-10">
        <h2 className="label">Contact</h2>
        <p className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s work together — reach out anytime.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={`mailto:${profile.email}`} className="btn-primary">
            {profile.email}
          </a>
          {profile.socials.github && (
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="btn-ghost">
              GitHub
            </a>
          )}
          {profile.socials.linkedin && (
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
              LinkedIn
            </a>
          )}
          {profile.socials.kaggle && (
            <a href={profile.socials.kaggle} target="_blank" rel="noreferrer" className="btn-ghost">
              Kaggle
            </a>
          )}
        </div>
      </div>
      <footer className="pt-10 text-center text-xs text-muted">
        © {new Date().getFullYear()} {profile.name}. Built with Next.js.
      </footer>
    </section>
  );
}
