import { profile } from "@/data/profile";
import { DecisionTreeMotif } from "./DecisionTreeMotif";

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl overflow-hidden px-6 py-16">
      <DecisionTreeMotif />
      <div className="relative">
        <h2 className="label mb-4">About</h2>
        <p className="max-w-3xl text-xl leading-relaxed text-foreground/90 sm:text-2xl">
          {profile.bio}
        </p>
      </div>
    </section>
  );
}
