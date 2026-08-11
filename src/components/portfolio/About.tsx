import { profile } from "@/data/profile";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="label mb-4">About</h2>
      <p className="max-w-3xl text-xl leading-relaxed text-foreground/90 sm:text-2xl">
        {profile.bio}
      </p>
    </section>
  );
}
