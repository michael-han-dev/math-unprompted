import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPACING = 15;
const CENTER = { x: 0.74, y: 0.38 };
const INFLUENCE = 140;
const PUSH = 0.9;
const WAKE = 0.12;
const SPRING = 0.03;
const DAMPING = 0.85;
const REST = 0.05;

interface Dot {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function build(width: number, height: number): Dot[] {
  const cx = width * CENTER.x;
  const cy = height * CENTER.y;
  const reach = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) + SPACING * 2;
  const count = Math.ceil((reach / SPACING) ** 2);
  const dots: Dot[] = [];
  for (let i = 1; i < count; i++) {
    const r = SPACING * Math.sqrt(i);
    const x = cx + r * Math.cos(i * GOLDEN_ANGLE);
    const y = cy + r * Math.sin(i * GOLDEN_ANGLE);
    const spread = (i * 0.618033988749) % 1;
    const fade = 0.55 + 0.45 * (1 - r / reach);
    dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, size: 0.8 + spread * 1.2, alpha: (0.16 + spread * 0.5) * fade });
  }
  return dots;
}

export function SpiralField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const still = prefersReducedMotion();
    const pointer = { x: NaN, y: NaN, vx: 0, vy: 0, at: 0 };
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame: number | null = null;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      const active = !Number.isNaN(pointer.x);
      let moving = false;
      for (const d of dots) {
        let near = false;
        if (active) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < INFLUENCE) {
            near = true;
            const f = (1 - dist / INFLUENCE) ** 2;
            d.vx += (dx / dist) * f * PUSH + pointer.vx * f * WAKE;
            d.vy += (dy / dist) * f * PUSH + pointer.vy * f * WAKE;
          }
        }
        d.vx = (d.vx + (d.hx - d.x) * SPRING) * DAMPING;
        d.vy = (d.vy + (d.hy - d.y) * SPRING) * DAMPING;
        d.x += d.vx;
        d.y += d.vy;
        if (!near && Math.abs(d.x - d.hx) + Math.abs(d.y - d.hy) < REST && Math.abs(d.vx) + Math.abs(d.vy) < REST) {
          d.x = d.hx;
          d.y = d.hy;
          d.vx = 0;
          d.vy = 0;
        } else {
          moving = true;
        }
      }
      pointer.vx *= 0.8;
      pointer.vy *= 0.8;
      draw();
      frame = active || moving ? window.requestAnimationFrame(step) : null;
    };

    const wake = () => {
      if (frame === null) frame = window.requestAnimationFrame(step);
    };

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getComputedStyle(canvas).color;
      dots = build(width, height);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (!Number.isNaN(pointer.x)) {
        const dt = Math.max(8, now - pointer.at) / 16;
        pointer.vx = Math.max(-40, Math.min(40, (e.clientX - pointer.x) / dt));
        pointer.vy = Math.max(-40, Math.min(40, (e.clientY - pointer.y) / dt));
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = now;
      wake();
    };

    const onLeave = () => {
      pointer.x = NaN;
      pointer.y = NaN;
      wake();
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) onLeave();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') onLeave();
    };

    layout();
    window.addEventListener('resize', layout);
    if (!still) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      document.addEventListener('pointerout', onOut);
    }
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  return <canvas className="field" ref={ref} aria-hidden="true" />;
}
