import { NextResponse } from "next/server";
import type { RemoteJob } from "@/lib/types";

interface RemoteOkEntry {
  id?: string;
  slug?: string;
  position?: string;
  company?: string;
  tags?: string[];
  url?: string;
  location?: string;
  date?: string;
  company_logo?: string;
  legal?: string; // present only on the first "metadata" entry
}

export async function GET() {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; personal-portfolio-dashboard/1.0; +https://github.com)",
        Accept: "application/json",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `RemoteOK responded with ${res.status}` },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as RemoteOkEntry[];

    const jobs: RemoteJob[] = raw
      .filter((e) => !e.legal && e.position && e.company)
      .slice(0, 80)
      .map((e) => ({
        id: `remoteok-${e.id ?? e.slug ?? e.position}`,
        source: "remoteok",
        title: e.position as string,
        company: e.company as string,
        tags: e.tags ?? [],
        url: e.url ? `https://remoteok.com${e.url}` : "https://remoteok.com",
        location: e.location || "Remote",
        workMode: "remote",
        postedAt: e.date,
        logo: e.company_logo,
      }));

    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json(
      { error: "Could not reach RemoteOK right now." },
      { status: 502 },
    );
  }
}
