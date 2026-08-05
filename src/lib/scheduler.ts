import { addDays, format } from "date-fns";
import type { Deadline, DayPlan, PlanBlock, Settings, SkillGoal } from "./types";
import { daysUntil, hoursUntil, urgencyScore } from "./deadlines";
import { uid } from "./store";

const MIN_SKILL_RATIO = 0.25;
const CRITICAL_WINDOW_HOURS = 24;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export interface ScheduleOptions {
  horizonDays?: number;
  from?: Date;
}

/**
 * Rule-based day-by-day planner. Greedily protects near-term deadlines,
 * always keeps a floor of skill-building/job-search time (unless something
 * is due within 24h), then fills remaining time by urgency.
 */
export function generatePlan(
  deadlines: Deadline[],
  skillGoals: SkillGoal[],
  settings: Settings,
  opts: ScheduleOptions = {},
): DayPlan[] {
  const horizonDays = opts.horizonDays ?? 10;
  const from = opts.from ?? new Date();

  const deadlineRemaining = new Map<string, number>(
    deadlines
      .filter((d) => d.status !== "done")
      .map((d) => [d.id, Math.max(d.estimatedHours, 0)]),
  );
  const goalRemaining = new Map<string, number>(
    skillGoals.map((g) => [g.id, Math.max(g.estimatedHours - g.hoursLogged, 0)]),
  );

  const days: DayPlan[] = [];

  for (let offset = 0; offset < horizonDays; offset++) {
    const date = addDays(from, offset);
    const dow = date.getDay();
    const iso = format(date, "yyyy-MM-dd");
    if (!settings.workDays.includes(dow)) continue;

    let budget = settings.dailyFreeHours;
    const blocks: PlanBlock[] = [];
    const dayEnd = addDays(date, 1);

    const active = deadlines.filter(
      (d) => d.status !== "done" && (deadlineRemaining.get(d.id) ?? 0) > 0.1,
    );

    const critical = active
      .filter((d) => hoursUntil(d.dueDate, dayEnd) <= CRITICAL_WINDOW_HOURS)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (const d of critical) {
      if (budget <= 0.1) break;
      const need = deadlineRemaining.get(d.id) ?? 0;
      const alloc = Math.min(need, budget);
      if (alloc > 0.1) {
        blocks.push({
          id: uid(),
          date: iso,
          title: d.title,
          hours: round1(alloc),
          type: "coursework",
          sourceId: d.id,
          reason:
            hoursUntil(d.dueDate, dayEnd) < 0
              ? "Overdue — top priority"
              : "Due within 24h — protected block",
        });
        budget -= alloc;
        deadlineRemaining.set(d.id, need - alloc);
      }
    }

    const skillReserve = budget > 0 ? Math.min(budget, settings.dailyFreeHours * MIN_SKILL_RATIO) : 0;
    let courseworkBudget = budget - skillReserve;

    const rest = active
      .filter((d) => !critical.includes(d) && (deadlineRemaining.get(d.id) ?? 0) > 0.1)
      .sort((a, b) => urgencyScore(b, date) - urgencyScore(a, date));

    for (const d of rest) {
      if (courseworkBudget <= 0.1) break;
      const need = deadlineRemaining.get(d.id) ?? 0;
      const cap = Math.min(need, courseworkBudget, Math.max(1, settings.dailyFreeHours * 0.6));
      if (cap > 0.1) {
        const dLeft = Math.max(1, Math.ceil(daysUntil(d.dueDate, date)));
        blocks.push({
          id: uid(),
          date: iso,
          title: d.title,
          hours: round1(cap),
          type: "coursework",
          sourceId: d.id,
          reason: `${dLeft}d left · ${d.priority} priority`,
        });
        courseworkBudget -= cap;
        deadlineRemaining.set(d.id, need - cap);
      }
    }

    let skillBudget = skillReserve + courseworkBudget;

    const activeGoals = skillGoals
      .filter((g) => (goalRemaining.get(g.id) ?? 0) > 0.1)
      .sort((a, b) => {
        const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (p !== 0) return p;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    for (const g of activeGoals) {
      if (skillBudget <= 0.1) break;
      const need = goalRemaining.get(g.id) ?? 0;
      const cap = Math.min(need, skillBudget, Math.max(0.5, settings.dailyFreeHours * 0.5));
      if (cap > 0.1) {
        blocks.push({
          id: uid(),
          date: iso,
          title: g.title,
          hours: round1(cap),
          type: "skill-building",
          sourceId: g.id,
          reason: `Career skill-building · ${g.priority} priority`,
        });
        skillBudget -= cap;
        goalRemaining.set(g.id, need - cap);
      }
    }

    if (skillBudget > 0.2 && activeGoals.length === 0) {
      blocks.push({
        id: uid(),
        date: iso,
        title: "Job search: applications & networking",
        hours: round1(skillBudget),
        type: "job-search",
        reason: "No active skill goals — add some in Settings, or use this slot for applications",
      });
    }

    const totalHours = round1(blocks.reduce((s, b) => s + b.hours, 0));
    if (blocks.length) days.push({ date: iso, blocks, totalHours });
  }

  return days;
}

export function planForDate(plan: DayPlan[], iso: string): DayPlan | undefined {
  return plan.find((d) => d.date === iso);
}

export function todayIso(from = new Date()) {
  return format(from, "yyyy-MM-dd");
}
