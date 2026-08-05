import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json({ error: "Invalid GitHub username." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `No contribution data found for "${username}".` },
        { status: res.status === 404 ? 404 : 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach GitHub contributions service." },
      { status: 502 },
    );
  }
}
