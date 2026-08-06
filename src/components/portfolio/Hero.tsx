"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { profile, heroStats } from "@/data/profile";
import { DataParticles } from "./DataParticles";
import { LiveActivityBackdrop } from "./LiveActivityBackdrop";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <DataParticles />
      <LiveActivityBackdrop githubUrl={profile.socials.github} />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 pt-20 sm:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="badge border-accent/30 text-accent"
        >
          Available for opportunities
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        >
          Hi, I&apos;m {profile.name}.
          <br />
          <span className="gradient-text">{profile.role}</span>, building &amp; shipping.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="max-w-xl text-lg text-muted"
        >
          {profile.tagline}
        </motion.p>

        {heroStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="flex flex-wrap gap-x-8 gap-y-3 pt-1"
          >
            {heroStats.map((s) => (
              <div key={s.label}>
                <p className="gradient-text text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="label mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="flex flex-wrap items-center gap-3 pt-2"
        >
          <a href="#projects" className="btn-primary">
            View projects
          </a>
          <Link href="/dashboard" className="btn-ghost">
            Explore my Command Center →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
