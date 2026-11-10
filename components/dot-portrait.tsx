"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; brightness: number };
type DotData = { width: number; height: number; desktop: Dot[]; mobile: Dot[] };

type Field = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  baseX: Float32Array;
  baseY: Float32Array;
  brightness: Float32Array;
  delay: Float32Array;
  radius: Float32Array;
  accent: Uint8Array;
  /** Dot size multiplier so a larger canvas keeps the same ink density instead of spreading thin. */
  radiusScale: number;
};

// Colors come from the CSS tokens so the portrait matches the rest of the site.
function readColors(element: HTMLElement) {
  const styles = getComputedStyle(element);
  return {
    dot: styles.getPropertyValue("--fg").trim() || "#f1efe8",
    accent: styles.getPropertyValue("--accent").trim() || "#b7ff3c",
  };
}

export function DotPortrait({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<DotData | null>(null);
  const fieldRef = useRef<Field | null>(null);
  const frameRef = useRef(0);
  const visibleRef = useRef(true);
  const activeRef = useRef(active);
  const reducedRef = useRef(false);
  const introStartedAt = useRef(0);
  const introDone = useRef(false);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });
  const scrollRef = useRef(0);
  const lastTimeRef = useRef(0);
  const drawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    activeRef.current = active;
    if (active && !introStartedAt.current) introStartedAt.current = performance.now();
    drawRef.current();
  }, [active]);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement === null) return;
    const rawContext = canvasElement.getContext("2d", { alpha: true });
    if (rawContext === null) return;
    const canvas: HTMLCanvasElement = canvasElement;
    const context: CanvasRenderingContext2D = rawContext;

    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let disposed = false;
    const colors = readColors(canvas);

    function createField(dots: Dot[], width: number, height: number, sourceWidth: number, sourceHeight: number): Field {
      const count = dots.length;
      const field: Field = {
        count,
        x: new Float32Array(count),
        y: new Float32Array(count),
        vx: new Float32Array(count),
        vy: new Float32Array(count),
        baseX: new Float32Array(count),
        baseY: new Float32Array(count),
        brightness: new Float32Array(count),
        delay: new Float32Array(count),
        radius: new Float32Array(count),
        radiusScale: 1,
        accent: new Uint8Array(count),
      };
      const scale = Math.min(width / sourceWidth, height / sourceHeight);
      // Dot pitch on screen; ~4.4px is where the halftone reads best (tablet size), so grow dots in step with it.
      const pitch = Math.sqrt((sourceWidth * sourceHeight) / Math.max(count, 1)) * scale;
      field.radiusScale = Math.min(2.2, Math.max(1, pitch / 4.4));
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      // Anchor to the bottom so the shoulders rest on the caption instead of floating.
      const offsetY = height - drawHeight;

      for (let index = 0; index < count; index += 1) {
        const dot = dots[index];
        const baseX = offsetX + dot.x * drawWidth;
        const baseY = offsetY + dot.y * drawHeight;
        field.baseX[index] = baseX;
        field.baseY[index] = baseY;
        field.brightness[index] = dot.brightness;
        field.delay[index] = dot.y * 520 + Math.random() * 130;
        if (reducedRef.current || introDone.current) {
          field.x[index] = baseX;
          field.y[index] = baseY;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const distance = 45 + Math.random() * Math.max(width, height) * 0.42;
          field.x[index] = baseX + Math.cos(angle) * distance;
          field.y[index] = baseY + Math.sin(angle) * distance;
        }
      }
      return field;
    }

    // Cached size: draw() runs every frame and must not force a layout read.
    const size = { width: 0, height: 0 };

    function resize() {
      const data = dataRef.current;
      if (!data) return;
      const rect = canvas.getBoundingClientRect();
      size.width = rect.width;
      size.height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dots = rect.width <= 680 ? data.mobile : data.desktop;
      fieldRef.current = createField(dots, rect.width, rect.height, data.width, data.height);
      if (reducedRef.current) draw(performance.now());
    }

    function updateScroll() {
      const rect = canvas.getBoundingClientRect();
      scrollRef.current = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height * 0.82, 1)));
    }

    function draw(time: number) {
      const field = fieldRef.current;
      if (!field) return;
      const { width, height } = size;
      context.clearRect(0, 0, width, height);
      const reduce = reducedRef.current;
      const elapsed = activeRef.current && introStartedAt.current ? time - introStartedAt.current : 0;
      const dt = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.033);
      lastTimeRef.current = time;
      const scroll = reduce ? 0 : scrollRef.current;
      const opacity = 1 - scroll * 0.92;
      const centerX = width / 2;
      const centerY = height / 2;
      const pointer = pointerRef.current;

      context.globalAlpha = opacity;
      context.fillStyle = colors.dot;
      context.beginPath();
      for (let index = 0; index < field.count; index += 1) {
        const introElapsed = elapsed - field.delay[index];
        const introProgress = reduce || introDone.current ? 1 : Math.max(0, Math.min(1, introElapsed / 820));
        if (!reduce && introProgress === 0) continue;

        const baseX = field.baseX[index];
        const baseY = field.baseY[index];
        let targetX = baseX + (baseX - centerX) * scroll * 0.14;
        let targetY = baseY + (baseY - centerY) * scroll * 0.14;
        let accented = false;

        if (!reduce && finePointer && pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 80 && distance > 0.1) {
            const force = (1 - distance / 80) * 28;
            targetX += (dx / distance) * force;
            targetY += (dy / distance) * force;
            accented = distance < 64;
          }
        }

        if (reduce) {
          field.x[index] = targetX;
          field.y[index] = targetY;
        } else {
          const spring = introProgress < 1 ? 95 : 72;
          const damping = introProgress < 1 ? 11.5 : 12.5;
          field.vx[index] += (targetX - field.x[index]) * spring * dt;
          field.vy[index] += (targetY - field.y[index]) * spring * dt;
          const drag = Math.exp(-damping * dt);
          field.vx[index] *= drag;
          field.vy[index] *= drag;
          field.x[index] += field.vx[index] * dt;
          field.y[index] += field.vy[index] * dt;
        }

        const tone = 0.18 + Math.pow(field.brightness[index], 1.18) * 1.75;
        const wave = reduce ? 1 : 1 + Math.sin(time * 0.0011 + baseX * 0.022 + baseY * 0.012) * 0.038;
        const radius = tone * field.radiusScale * wave * introProgress;
        field.radius[index] = radius;
        field.accent[index] = accented ? 1 : 0;
        if (radius < 0.16 * field.radiusScale) continue;
        context.moveTo(field.x[index] + radius, field.y[index]);
        context.arc(field.x[index], field.y[index], radius, 0, Math.PI * 2);
      }
      context.fill();

      if (!reduce && finePointer && pointer.active) {
        context.fillStyle = colors.accent;
        context.beginPath();
        for (let index = 0; index < field.count; index += 1) {
          if (!field.accent[index]) continue;
          const radius = field.radius[index];
          context.moveTo(field.x[index] + radius, field.y[index]);
          context.arc(field.x[index], field.y[index], radius, 0, Math.PI * 2);
        }
        context.fill();
      }
      context.globalAlpha = 1;

      if (!introDone.current && elapsed > 1600) introDone.current = true;
    }

    let frameCount = 0;
    let lastScroll = -1;
    function tick(time: number) {
      if (disposed) return;
      // Once settled, the slow breathing only needs ~30 fps; pointer, scroll and the intro stay at full rate.
      const idle = introDone.current && !pointerRef.current.active && scrollRef.current === lastScroll;
      frameCount += 1;
      if (visibleRef.current && !document.hidden && activeRef.current && (!idle || frameCount % 2 === 0)) {
        lastScroll = scrollRef.current;
        draw(time);
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    drawRef.current = () => draw(performance.now());
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) lastTimeRef.current = performance.now();
    }, { threshold: 0.02 });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const onPointerMove = (event: globalThis.PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = event.clientX - rect.left;
      pointerRef.current.y = event.clientY - rect.top;
      pointerRef.current.active = true;
    };
    const onPointerLeave = () => { pointerRef.current.active = false; };
    if (finePointer) {
      canvas.addEventListener("pointermove", onPointerMove, { passive: true });
      canvas.addEventListener("pointerleave", onPointerLeave);
    }
    window.addEventListener("scroll", updateScroll, { passive: true });

    fetch("/portrait-dots.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Portrait data failed: ${response.status}`);
        return response.json() as Promise<DotData>;
      })
      .then((data) => {
        if (disposed) return;
        dataRef.current = data;
        resize();
        updateScroll();
        // Start the gather animation when the dots exist, not when the component mounted.
        if (activeRef.current) introStartedAt.current = performance.now();
        if (reducedRef.current) draw(performance.now());
      })
      .catch((error) => console.error(error));

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateScroll);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="dot-portrait"
      role="img"
      aria-label="Dotted portrait of Lakshya Gupta"
    />
  );
}

