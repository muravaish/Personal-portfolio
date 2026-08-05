"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  useChatHistory,
  useDeadlines,
  useSessions,
  useSettings,
  useSkillGoals,
  useSkillProfile,
  uid,
} from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { askClaude, ruleBasedAnswer, type AssistantContext } from "@/lib/ai";
import { generatePlan } from "@/lib/scheduler";

const SUGGESTIONS = [
  "What should I focus on today?",
  "Am I overdue on anything?",
  "What's coming up this week?",
  "How is my productivity looking?",
];

export function AssistantView() {
  const [history, setHistory, hydrated] = useChatHistory();
  const [settings] = useSettings();
  const [deadlines] = useDeadlines();
  const [sessions] = useSessions();
  const [skillGoals] = useSkillGoals();
  const [skillProfile] = useSkillProfile();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasKey = Boolean(settings.anthropicApiKey);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setLoading(true);

    const ctx: AssistantContext = {
      deadlines,
      sessions,
      skillGoals,
      skillProfile,
      settings,
      plan: generatePlan(deadlines, skillGoals, settings, { horizonDays: 10 }),
    };

    try {
      const reply = hasKey
        ? await askClaude(settings, ctx, history, message)
        : ruleBasedAnswer(message, ctx);
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setHistory([...nextHistory, assistantMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[28rem] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted">
          {hasKey ? (
            "Connected to your Anthropic API key — ask anything, grounded in your live deadlines, plan, and activity."
          ) : (
            <>
              No API key set — running on built-in logic over your tracked data.{" "}
              <Link href="/dashboard/settings" className="text-accent-2 hover:underline">
                Add a key in Settings
              </Link>{" "}
              for open-ended chat.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border p-4">
        {history.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="btn-ghost text-xs" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {history.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "self-end bg-accent/20" : "self-start card"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="self-start text-xs text-muted">Thinking…</div>}
        {error && <div className="self-start text-xs text-danger">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Ask about your deadlines, schedule, or progress…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={() => send()} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
