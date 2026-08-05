import { SiteNav } from "@/components/nav/SiteNav";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Certifications } from "@/components/portfolio/Certifications";
import { Contact } from "@/components/portfolio/Contact";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Certifications />
      <Contact />
    </div>
  );
}
