"use client";

import { useEffect, useRef } from "react";

interface Point {
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  amp: number;
}

interface Anomaly {
  index: number;
  start: number;
}

const POINT_COUNT = 56;
const BUCKETS = 12;
const ANOMALY_INTERVAL_MS = 4200;
const ANOMALY_LIFETIME_MS = 2600;
const MAX_ANOMALIES = 2;

const INK = "36, 31, 24";
const TREND = "168, 68, 28";
const FLAG = "184, 56, 42";

/**
 * A live "analysis in progress" backdrop: scattered points that gently drift,
 * a regression curve that continuously refits itself to their current
 * positions, and occasional points flagged as anomalies — the visual
 * grammar of EDA/forecasting/anomaly-detection work, animated, not literal
 * screenshots.
 */
export function LiveAnalysisBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];
    const anomalies: Anomaly[] = [];
    let lastAnomalyAt = 0;

    function seedPoints() {
      points = Array.from({ length: POINT_COUNT }, () => {
        const xNorm = Math.random();
        const trend =
          Math.sin(xNorm * Math.PI * 2.1 + 0.6) * 0.28 + Math.sin(xNorm * Math.PI * 4.4) * 0.12;
        const yNorm = 0.5 - trend + (Math.random() - 0.5) * 0.32;
        return {
          baseX: xNorm * width,
          baseY: Math.min(0.92, Math.max(0.08, yNorm)) * height,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.5,
          amp: 4 + Math.random() * 7,
        };
      });
    }

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      width = c.clientWidth;
      height = c.clientHeight;
      c.width = width * dpr;
      c.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedPoints();
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    let frame = 0;

    function currentPos(p: Point, t: number) {
      return {
        x: p.baseX + Math.sin(t * 0.001 * p.speed + p.phase) * p.amp * 0.3,
        y: p.baseY + Math.sin(t * 0.0013 * p.speed + p.phase * 1.7) * p.amp,
      };
    }

    function drawGrid() {
      ctx!.strokeStyle = `rgba(${INK}, 0.05)`;
      ctx!.lineWidth = 1;
      const cols = 8;
      const rows = 6;
      for (let i = 1; i < cols; i++) {
        const x = (width / cols) * i;
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let i = 1; i < rows; i++) {
        const y = (height / rows) * i;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }
    }

    function drawTrend(positions: { x: number; y: number }[]) {
      const buckets: { sum: number; count: number }[] = Array.from({ length: BUCKETS }, () => ({
        sum: 0,
        count: 0,
      }));
      for (const p of positions) {
        const idx = Math.min(BUCKETS - 1, Math.max(0, Math.floor((p.x / width) * BUCKETS)));
        buckets[idx].sum += p.y;
        buckets[idx].count += 1;
      }
      const nodes: { x: number; y: number }[] = [];
      buckets.forEach((b, i) => {
        if (b.count === 0) return;
        nodes.push({ x: ((i + 0.5) / BUCKETS) * width, y: b.sum / b.count });
      });
      if (nodes.length < 2) return;

      ctx!.strokeStyle = `rgba(${TREND}, 0.28)`;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length - 1; i++) {
        const midX = (nodes[i].x + nodes[i + 1].x) / 2;
        const midY = (nodes[i].y + nodes[i + 1].y) / 2;
        ctx!.quadraticCurveTo(nodes[i].x, nodes[i].y, midX, midY);
      }
      const last = nodes[nodes.length - 1];
      ctx!.lineTo(last.x, last.y);
      ctx!.stroke();
    }

    function maybeFlagAnomaly(now: number) {
      if (now - lastAnomalyAt < ANOMALY_INTERVAL_MS) return;
      if (anomalies.length >= MAX_ANOMALIES) return;
      const used = new Set(anomalies.map((a) => a.index));
      let index = Math.floor(Math.random() * points.length);
      let tries = 0;
      while (used.has(index) && tries < 10) {
        index = Math.floor(Math.random() * points.length);
        tries++;
      }
      anomalies.push({ index, start: now });
      lastAnomalyAt = now;
    }

    function step(now: number) {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      if (reduceMotion && frame > 0) return;
      frame++;
      ctx!.clearRect(0, 0, width, height);

      drawGrid();

      const positions = points.map((p) => currentPos(p, now));
      drawTrend(positions);

      for (const pos of positions) {
        ctx!.fillStyle = `rgba(${INK}, 0.3)`;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reduceMotion) maybeFlagAnomaly(now);
      for (let i = anomalies.length - 1; i >= 0; i--) {
        const a = anomalies[i];
        const age = now - a.start;
        if (age > ANOMALY_LIFETIME_MS) {
          anomalies.splice(i, 1);
          continue;
        }
        const pos = positions[a.index];
        if (!pos) continue;
        const t = age / ANOMALY_LIFETIME_MS;
        const radius = 4 + t * 9;
        ctx!.strokeStyle = `rgba(${FLAG}, ${0.55 * (1 - t)})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.fillStyle = `rgba(${FLAG}, ${0.7 * (1 - t)})`;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 2.6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
