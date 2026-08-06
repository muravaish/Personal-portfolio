import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const username = process.env.DASHBOARD_USERNAME || "admin";
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === username && pass === password) {
      return NextResponse.next();
    }
  }

  return new Response("Admin access required for the Command Center.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Command Center"' },
  });
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
