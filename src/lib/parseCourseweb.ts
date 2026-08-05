const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Parses a Moodle-style date like "Tuesday, 11 August 2026, 12:00 PM". */
export function parseMoodleDate(text: string): Date | null {
  const match = text.match(
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
  );
  if (!match) return null;
  const [, dayStr, monthStr, yearStr, hourStr, minuteStr, ampm] = match;
  const monthIndex = MONTHS.indexOf(monthStr.toLowerCase());
  if (monthIndex === -1) return null;

  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (ampm) {
    const isPM = ampm.toUpperCase() === "PM";
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
  }

  const date = new Date(parseInt(yearStr, 10), monthIndex, parseInt(dayStr, 10), hour, minute);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface ParsedCoursewebPaste {
  title: string;
  dueDate: Date | null;
  opensDate: Date | null;
}

/**
 * Parses text pasted straight from a CourseWeb (Moodle) activity page, e.g.:
 *   Kandy Uni - Lab 2 Submission
 *   Opens: Sunday, 9 August 2026, 8:00 AM
 *   Due: Tuesday, 11 August 2026, 12:00 PM
 */
export function parsePastedDeadline(raw: string): ParsedCoursewebPaste {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let dueDate: Date | null = null;
  let opensDate: Date | null = null;
  let title = "";

  for (const line of lines) {
    const dueMatch = line.match(/^due:?\s*(.+)/i);
    const opensMatch = line.match(/^opens?:?\s*(.+)/i);
    if (dueMatch) {
      dueDate = parseMoodleDate(dueMatch[1]);
      continue;
    }
    if (opensMatch) {
      opensDate = parseMoodleDate(opensMatch[1]);
      continue;
    }
    if (!title && !/^(submission status|grading status|time remaining|last modified|submission comments)/i.test(line)) {
      title = line;
    }
  }

  return { title, dueDate, opensDate };
}
