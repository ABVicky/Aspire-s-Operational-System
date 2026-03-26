'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SEGMENTS = 10;

function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function CursorTail() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const segRefs = useRef<Array<HTMLDivElement | null>>([]);

  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });

  const hoverRef = useRef({ active: false, strength: 0 });
  const pressRef = useRef({ at: 0 });

  const segmentMeta = useMemo(() => {
    return Array.from({ length: SEGMENTS }, (_, i) => {
      const t = i / Math.max(1, SEGMENTS - 1);
      const size = 28 - t * 18;
      const opacity = 0.26 * (1 - t) + 0.05;
      const blur = 1 + t * 3.5;
      return { size, opacity, blur, scale: 1 - t * 0.15 };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isCoarsePointer() || prefersReducedMotion()) return;
    // Login page relies on native cursor affordances (drag/grab + hover states).
    if (pathname === '/login') return;

    // Only enable after mount so there is no server/client mismatch.
    setEnabled(true);

    document.body.classList.add('cursor-hidden');
    return () => {
      document.body.classList.remove('cursor-hidden');
      setEnabled(false);
    };
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    trailRef.current = {
      xs: Array.from({ length: SEGMENTS }, () => startX),
      ys: Array.from({ length: SEGMENTS }, () => startY),
    };

    const interactiveSelector =
      'a,button,input,textarea,select,[role="button"],[data-cursor-hover="true"]';

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const onPointerOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      const hit = el?.closest?.(interactiveSelector);
      if (!hit) return;
      hoverRef.current.active = true;
    };

    const onPointerOut = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      const hit = el?.closest?.(interactiveSelector);
      if (!hit) return;
      hoverRef.current.active = false;
    };

    const onPointerDown = () => {
      pressRef.current.at = Date.now();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver);
    window.addEventListener('pointerout', onPointerOut);
    window.addEventListener('pointerdown', onPointerDown);

    const tick = () => {
      const cursorEl = cursorRef.current;
      if (!cursorEl) return;

      const { x: tx, y: ty } = targetRef.current;
      const { x, y } = posRef.current;
      // The cursor itself eases, then the trail follows with different inertia.
      const ease = 0.35;
      posRef.current = { x: x + (tx - x) * ease, y: y + (ty - y) * ease };

      const now = Date.now();
      const pressT = clamp01((now - pressRef.current.at) / 220);
      const pressScale = pressRef.current.at > 0 ? 1 + (1 - pressT) * 0.18 : 1;

      hoverRef.current.strength += (hoverRef.current.active ? 1 : 0) * 0.08;
      hoverRef.current.strength = clamp01(hoverRef.current.strength);
      const hoverScale = 1 + hoverRef.current.strength * 0.45;

      // Update main cursor.
      cursorEl.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(${pressScale * hoverScale})`;

      // Update trail segments.
      for (let i = 0; i < SEGMENTS; i++) {
        const prevX = i === 0 ? posRef.current.x : trailRef.current.xs[i - 1];
        const prevY = i === 0 ? posRef.current.y : trailRef.current.ys[i - 1];
        const follow = i === 0 ? 0.22 : 0.14;
        trailRef.current.xs[i] = trailRef.current.xs[i] + (prevX - trailRef.current.xs[i]) * follow;
        trailRef.current.ys[i] = trailRef.current.ys[i] + (prevY - trailRef.current.ys[i]) * follow;

        const el = segRefs.current[i];
        if (!el) continue;
        el.style.transform = `translate3d(${trailRef.current.xs[i]}px, ${trailRef.current.ys[i]}px, 0) translate(-50%, -50%) scale(${segmentMeta[i].scale + hoverRef.current.strength * 0.05})`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointerdown', onPointerDown);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, segmentMeta]);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} aria-hidden="true" className="cursor-tail-wrap">
      <div ref={cursorRef} className="cursor-tail-cursor" />
      {segmentMeta.map((m, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          ref={(el) => {
            segRefs.current[i] = el;
          }}
          className="cursor-tail-segment"
          style={{
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            filter: `blur(${m.blur}px)`,
          }}
        />
      ))}
    </div>
  );
}

