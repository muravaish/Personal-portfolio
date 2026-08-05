import type {
  ChatMessage,
  DayPlan,
  Deadline,
  Settings,
  SkillGoal,
  SkillProfile,
  WorkSession,
} from "./types";
import { isOverdue, isDueSoon, upcoming } from "./deadlines";
import { todayIso, planForDate } from "./scheduler";

export interface AssistantContext {
  deadlines: Deadline[];
  plan: DayPlan[];
  sessions: WorkSession[];
  skillGoals: SkillGoal[];
  skillProfile: SkillProfile;
  settings: Settings;
}

export function buildContextSummary(ctx: AssistantContext): string {
  const now = new Date();
  const overdue = ctx.deadlines.filter((d) => isOverdue(d, now));
  const dueSoon = ctx.deadlines.filter(
    (d) => !isOverdue(d, now) && isDueSoon(d, ctx.settings.reminderWindowHours, now),
  );
  const next5 = upcoming(ctx.deadlines).slice(0, 5);
  const today = planForDate(ctx.plan, todayIso(now));

  const lines: string[] = [];
  lines.push(`Today's date: ${now.toDateString()}.`);
  lines.push(
    `Overdue deadlines: ${overdue.length ? overdue.map((d) => `"${d.title}" (${d.course}, was due ${new Date(d.dueDate).toLocaleString()})`).join("; ") : "none"}.`,
  );
  lines.push(
    `Due within ${ctx.settings.reminderWindowHours}h: ${dueSoon.length ? dueSoon.map((d) => `"${d.title}" due ${new Date(d.dueDate).toLocaleString()}`).join("; ") : "none"}.`,
  );
  lines.push(
    `Next 5 upcoming deadlines: ${next5.length ? next5.map((d) => `"${d.title}" (${d.course}, ${d.priority} priority, ~${d.estimatedHours}h, due ${new Date(d.dueDate).toLocaleDateString()})`).join("; ") : "none scheduled"}.`,
  );
  lines.push(
    `Today's generated plan: ${today ? today.blocks.map((b) => `${b.title} (${b.hours}h, ${b.type})`).join("; ") : "no plan generated for today yet"}.`,
  );
  lines.push(
    `Active skill-building goals: ${ctx.skillGoals.length ? ctx.skillGoals.map((g) => `"${g.title}" (${g.hoursLogged}/${g.estimatedHours}h, ${g.priority})`).join("; ") : "none set"}.`,
  );
  lines.push(
    `Skill profile: skills=[${ctx.skillProfile.skills.join(", ") || "none set"}], target roles=[${ctx.skillProfile.targetRoles.join(", ") || "none set"}], location preference=${ctx.skillProfile.locationPreference}.`,
  );
  const last7 = ctx.sessions.filter((s) => {
    const d = new Date(s.date).getTime();
    return d >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
  });
  const totalMin = last7.reduce((s, x) => s + x.durationMinutes, 0);
  lines.push(`Logged work in the last 7 days: ${(totalMin / 60).toFixed(1)}h across ${last7.length} sessions.`);

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are the personal productivity co-pilot embedded in this user's portfolio dashboard. You help them stay on top of university coursework deadlines, balance study time with career/skill-building work, and answer study or career doubts. Be concise, warm, and practical. When asked what to prioritize, reason from the live data you're given below — don't invent deadlines or facts not present in it. If something is overdue, say so plainly and suggest a concrete next step.`;

export async function askClaude(
  settings: Settings,
  ctx: AssistantContext,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const contextSummary = buildContextSummary(ctx);
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: settings.aiModel || "claude-sonnet-5",
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\nCurrent data:\n${contextSummary}`,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.content
    ?.filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
  return text || "I couldn't generate a response.";
}

/** No-API-key fallback: answers common questions directly from local data. */
export function ruleBasedAnswer(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();
  const now = new Date();
  const overdue = ctx.deadlines.filter((d) => isOverdue(d, now));
  const dueSoon = ctx.deadlines.filter(
    (d) => !isOverdue(d, now) && isDueSoon(d, ctx.settings.reminderWindowHours, now),
  );
  const today = planForDate(ctx.plan, todayIso(now));

  if (/overdue|missed|late/.test(q)) {
    if (!overdue.length) return "Nothing is overdue right now — you're clear.";
    return `You have ${overdue.length} overdue item(s): ${overdue.map((d) => `"${d.title}" (${d.course})`).join(", ")}. Submit these first.`;
  }

  if (/today|now|priorit|focus|what should i/.test(q)) {
    if (overdue.length) {
      return `Start with what's overdue: ${overdue.map((d) => `"${d.title}"`).join(", ")}. After that, ${today ? `today's plan has ${today.blocks.length} block(s) totaling ${today.totalHours}h: ${today.blocks.map((b) => `${b.title} (${b.hours}h)`).join(", ")}.` : "no plan is generated yet — visit Schedule to generate one."}`;
    }
    if (today && today.blocks.length) {
      return `Today's plan: ${today.blocks.map((b) => `${b.title} — ${b.hours}h (${b.type})`).join("; ")}.`;
    }
    return "No plan for today yet. Go to Schedule and generate one from your current deadlines and skill goals.";
  }

  if (/due soon|coming up|next deadline|upcoming/.test(q)) {
    const next5 = upcoming(ctx.deadlines).slice(0, 5);
    if (!next5.length) return "No upcoming deadlines tracked yet — add some in Deadlines.";
    return `Upcoming: ${next5.map((d) => `"${d.title}" due ${new Date(d.dueDate).toLocaleString()}`).join("; ")}.`;
  }

  if (/how am i doing|productiv|progress|streak/.test(q)) {
    const last7 = ctx.sessions.filter(
      (s) => new Date(s.date).getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const hrs = (last7.reduce((s, x) => s + x.durationMinutes, 0) / 60).toFixed(1);
    return `You've logged ${hrs}h across ${last7.length} session(s) in the last 7 days. ${dueSoon.length ? `Heads up: ${dueSoon.length} item(s) due within ${ctx.settings.reminderWindowHours}h.` : ""}`.trim();
  }

  return `I can answer directly from your tracked data (try asking about "today", "overdue", "upcoming deadlines", or "my progress"), but for open-ended questions add an Anthropic API key in Settings so I can reason more freely.`;
}
