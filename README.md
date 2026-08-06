# Personal Portfolio + Command Center

A personal portfolio (Next.js + TypeScript + Tailwind) with a built-in productivity
dashboard: real university deadline tracking, a heuristic scheduler that balances
coursework with job-prep, an activity tracker, a skill-matched job board, and a
BYO-API-key AI assistant.

Everything runs client-first — all personal data (deadlines, sessions, skill
profile, settings, API key) lives only in the browser's `localStorage`. Nothing is
sent to any server except the direct calls each feature needs: your CourseWeb
calendar URL, your GitHub username, RemoteOK, and (if you add a key) the Anthropic
API.

## 1. Make it yours

Edit `src/data/profile.ts` with your real name, bio, skills, and projects, and
`src/data/local-jobs-lk.json` if you want to refresh the sample Sri Lanka job
listings (see note below). Nothing else needs to change to run locally.

## 2. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the portfolio, or
[http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the command
center.

## Features

- **Deadlines** (`/dashboard/deadlines`) — manual entry, plus two ways to pull in
  real CourseWeb (Moodle) assignment/quiz deadlines without ever storing your
  password:
  - **Calendar sync**: paste your Moodle calendar export URL (Preferences →
    Calendar → Export calendar) in Settings, then hit "Sync now". This contains a
    private token, not your login.
  - **Paste from CourseWeb**: if your institution has calendar export disabled,
    copy the activity title and "Opens/Due" block straight off the module page and
    paste it in — it parses the real due date out of that text.
- **Schedule** (`/dashboard/schedule`) — a rule-based day planner
  (`src/lib/scheduler.ts`) that protects near-term deadlines, always reserves a
  floor of time for skill-building/job-search goals, and explains its reasoning
  per block.
- **Activity** (`/dashboard/activity`) — self-logged work sessions with streaks,
  a real GitHub contribution heatmap (via the public
  `github-contributions-api.jogruber.de`, no token needed), and planned-vs-actual
  tracking against the generated schedule.
- **Job Matcher** (`/dashboard/jobs`) — live remote listings from the RemoteOK
  public API, ranked against your skill profile, plus a small curated sample of
  Sri Lanka onsite/hybrid roles (`src/data/local-jobs-lk.json` — no free public
  API exists for local job boards, so this is a manually-edited/swappable seed
  file, not a live feed).
- **AI Assistant** (`/dashboard/assistant`) — bring your own Anthropic API key
  (Settings) for open-ended chat grounded in your live deadlines/plan/activity; with
  no key set, it still answers common questions directly from your tracked data.

## Notes

- Never put a real login password into this app. The CourseWeb integration is
  designed around Moodle's token-based calendar export specifically so your
  Microsoft/SSO credentials never need to touch it.
- The RemoteOK and GitHub contribution endpoints are called from Next.js Route
  Handlers (`src/app/api/*`) so the browser never needs direct CORS access to
  third-party APIs.

## Deploy

Any Next.js host works (e.g. [Vercel](https://vercel.com/new)). No environment
variables or database are required for the portfolio itself — everything is
client-stored.

### Password-protect the Command Center (optional but recommended)

The `/dashboard` section is public by default (it's harmless to strangers since
all data is per-browser, but it looks more intentional locked). To require a
login, set these environment variables on your host:

- `DASHBOARD_PASSWORD` — required to turn the lock on at all
- `DASHBOARD_USERNAME` — optional, defaults to `admin`

This uses standard HTTP Basic Auth (`src/proxy.ts`), checked on the server
before any dashboard page loads — not just a client-side check. Note this is a
simple deterrent, not bank-grade security: credentials travel base64-encoded
per request (fine over HTTPS, which all major hosts provide by default) and
there's no rate limiting or lockout.
