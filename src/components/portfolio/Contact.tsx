import { profile } from "@/data/profile";
import { TechIcon } from "./TechIcon";

export function Contact() {
  return (
    <section id="contact" className="w-full bg-[#131313] py-20 text-[#f5f0e6]">
      <div className="mx-auto max-w-6xl px-6">
        <p className="label text-white/50">Contact</p>
        <p className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s work together — reach out anytime.
        </p>

        <a
          href={`mailto:${profile.email}`}
          className="mt-10 block w-fit text-3xl font-extrabold tracking-tight transition-colors hover:text-accent sm:text-5xl"
        >
          {profile.email}
        </a>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm">
          {profile.socials.github && (
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <TechIcon name="github" />
              GitHub
            </a>
          )}
          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              LinkedIn
            </a>
          )}
          {profile.socials.kaggle && (
            <a
              href={profile.socials.kaggle}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <TechIcon name="kaggle" />
              Kaggle
            </a>
          )}
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-2 text-xs text-white/40">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </section>
  );
}
