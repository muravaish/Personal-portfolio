import { NextResponse } from "next/server";
import ical from "node-ical";

export interface CoursewebEvent {
  externalId: string;
  title: string;
  course: string;
  dueDate: string;
  description?: string;
  sourceUrl?: string;
}

const LOOKBACK_DAYS = 14;
const LOOKAHEAD_DAYS = 365;

function cleanTitle(summary: string): { title: string; course: string } {
  const trimmed = summary.replace(/\s+is due\s*$/i, "").trim();
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 20) {
    const left = trimmed.slice(0, colonIdx).trim();
    const right = trimmed.slice(colonIdx + 1).trim();
    if (left && right) {
      return { title: right, course: left };
    }
  }
  return { title: trimmed, course: "CourseWeb" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icsUrl = searchParams.get("url");

  if (!icsUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter." },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(icsUrl);
  } catch {
    return NextResponse.json({ error: "That's not a valid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json(
      { error: "The calendar URL must be http or https." },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let body: string;
  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { Accept: "text/calendar,text/plain,*/*" },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          error: `CourseWeb responded with ${res.status}. Check the export URL is still valid (re-generate it in Calendar > Export calendar if needed).`,
        },
        { status: 502 },
      );
    }
    body = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Could not reach that calendar URL. Check the link and your network." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!body.includes("BEGIN:VCALENDAR")) {
    return NextResponse.json(
      {
        error:
          "That link didn't return a calendar (.ics) file — it may be expired, private, or not an export URL. Re-copy it from CourseWeb: Calendar > Export calendar.",
      },
      { status: 422 },
    );
  }

  let data: ReturnType<typeof ical.sync.parseICS>;
  try {
    data = ical.sync.parseICS(body);
  } catch {
    return NextResponse.json(
      { error: "Couldn't parse that calendar file." },
      { status: 422 },
    );
  }

  const now = Date.now();
  const minTime = now - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const maxTime = now + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000;

  const events: CoursewebEvent[] = [];
  for (const key of Object.keys(data)) {
    const item = data[key];
    if (!item || item.type !== "VEVENT") continue;
    const start = item.start ? new Date(item.start as unknown as string) : undefined;
    if (!start || Number.isNaN(start.getTime())) continue;
    const t = start.getTime();
    if (t < minTime || t > maxTime) continue;

    const summary = typeof item.summary === "string" ? item.summary : String(item.summary ?? "Untitled");
    const { title, course } = cleanTitle(summary);

    events.push({
      externalId: item.uid ? String(item.uid) : `${key}`,
      title,
      course,
      dueDate: start.toISOString(),
      description: typeof item.description === "string" ? item.description : undefined,
      sourceUrl: typeof item.url === "string" ? item.url : undefined,
    });
  }

  events.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return NextResponse.json({ events });
}
