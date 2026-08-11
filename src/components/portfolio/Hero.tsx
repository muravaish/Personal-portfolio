"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { profile, heroStats } from "@/data/profile";
import { LiveAnalysisBackdrop } from "./LiveAnalysisBackdrop";
import { LiveActivityBackdrop } from "./LiveActivityBackdrop";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--accent-from),transparent_70%)] opacity-25 blur-3xl" />
        <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--accent-to),transparent_70%)] opacity-20 blur-3xl" />
      </div>
      <LiveAnalysisBackdrop />
      <LiveActivityBackdrop githubUrl={profile.socials.github} />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-6">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-full bg-[linear-gradient(100deg,var(--accent-from),var(--accent-to))] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_var(--accent)]"
          >
            Available for opportunities
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-xl text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl"
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
              className="flex flex-wrap divide-x divide-border pt-2"
            >
              {heroStats.map((s) => (
                <div key={s.label} className="px-6 first:pl-0">
                  <p className="text-3xl font-extrabold tracking-tight">{s.value}</p>
                  <p className="label mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-wrap items-center gap-3 pt-4"
          >
            <a href="#projects" className="btn-primary">
              View projects
            </a>
            <Link href="/dashboard" className="btn-ghost">
              Explore my Command Center →
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto w-full max-w-sm lg:mx-0"
        >
          <div className="card relative aspect-[4/5] overflow-hidden">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,var(--overlay-soft),var(--overlay-soft)_10px,transparent_10px,transparent_20px)] p-6 text-center">
                <span className="text-4xl font-extrabold text-muted/40">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <p className="label">Add your photo in Dashboard → Portfolio Content</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
