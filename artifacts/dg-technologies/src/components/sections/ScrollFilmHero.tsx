import React, { useEffect, useRef, useState } from 'react';
import { Hero } from './Hero';
import { MagneticButton } from '../ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';

/**
 * SIGNAL — the scroll-film hero. One continuous generated shot (night city →
 * azure ignition → converging light threads → abstract azure space) scrubbed
 * on a canvas as the visitor scrolls, then handed off into the page content.
 *
 * Frames + metadata are served from public/film/ (manifest.json, f_0001.jpg…).
 * If the manifest is missing or the visitor prefers reduced motion, this
 * renders the original static <Hero /> instead — the site never breaks.
 */

interface Manifest {
  frameCount: number;
  seam: string; // '#rrggbb' sampled from the final frame's bottom strip
}

interface BeatDef {
  in: number;
  peak: number;
  out: number;
  render: () => React.ReactNode;
}

const CHAPTERS = ['The City', 'Ignition', 'The Signal', 'Convergence', 'Found'];

const BEATS: BeatDef[] = [
  {
    in: -0.1,
    peak: 0,
    out: 0.16,
    render: () => (
      <>
        <h1
          className="font-extrabold tracking-tighter leading-[1.05] mb-6 max-w-5xl"
          style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)' }}
        >
          Your Business Deserves to Be <span className="text-gradient">Found Online.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed">
          We build clean, professional websites for small businesses — one phone
          call, a plan, and a launch.
        </p>
        <p className="mt-10 text-sm font-medium tracking-widest uppercase text-white/70">
          Scroll ↓
        </p>
      </>
    ),
  },
  {
    in: 0.17,
    peak: 0.24,
    out: 0.33,
    render: () => (
      <>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Right now, someone is searching for exactly what you do.
        </h2>
        <p className="mt-4 text-lg md:text-xl text-white/90">
          They can't find you in the dark.
        </p>
      </>
    ),
  },
  {
    in: 0.37,
    peak: 0.44,
    out: 0.53,
    render: () => (
      <>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
          One phone call <span className="text-gradient">turns the lights on.</span>
        </h2>
        <p className="mt-4 text-lg md:text-xl text-white/90">
          No tech skills. No complicated process.
        </p>
      </>
    ),
  },
  {
    in: 0.57,
    peak: 0.64,
    out: 0.73,
    render: () => (
      <>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Your signal spreads.
        </h2>
        <p className="mt-4 text-lg md:text-xl text-white/90">
          A clean, professional site that puts you on the map.
        </p>
      </>
    ),
  },
  {
    // Finale: out > 1.5 → never fades; hands off into the content below.
    in: 0.8,
    peak: 0.88,
    out: 2,
    render: () => (
      <>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl [text-shadow:0_2px_16px_rgba(0,0,0,0.8),0_0_48px_rgba(0,0,0,0.6)]">
          Be the business they find.
        </h2>
        <div className="mt-10 flex flex-col items-center gap-5">
          <MagneticButton href={BOOKING_URL} variant="primary" className="text-lg px-10 py-5">
            Book Your Free Strategy Call
          </MagneticButton>
          <p className="text-sm font-medium text-white/60">
            Flat fees from $999 · Done over the phone · Launched in days
          </p>
        </div>
      </>
    ),
  },
];

function beatAlpha(b: BeatDef, p: number): number {
  if (p < b.in || p > b.out) return 0;
  if (p < b.peak) return (p - b.in) / Math.max(1e-4, b.peak - b.in);
  if (b.out > 1.5) return 1;
  return 1 - (p - b.peak) / Math.max(1e-4, b.out - b.peak);
}

function frameUrl(base: string, i: number): string {
  return `${base}film/f_${String(i + 1).padStart(4, '0')}.jpg`;
}

export function ScrollFilmHero() {
  const [mode, setMode] = useState<'pending' | 'film' | 'fallback'>('pending');
  const [manifest, setManifest] = useState<Manifest | null>(null);

  const driverRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const readoutLabelRef = useRef<HTMLSpanElement>(null);
  const readoutBarRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  // Decide film vs fallback: reduced motion opts out; a missing manifest
  // (film not generated yet, or fetch error) falls back to the static hero.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('fallback');
      return;
    }
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}film/manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((m: Manifest) => {
        if (cancelled) return;
        if (!m || !Number.isFinite(m.frameCount) || m.frameCount < 2) throw new Error('bad manifest');
        setManifest(m);
        setMode('film');
      })
      .catch(() => {
        if (!cancelled) setMode('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'film' || !manifest) return;
    const driver = driverRef.current;
    const canvas = canvasRef.current;
    if (!driver || !canvas) return;

    const FRAME_COUNT = manifest.frameCount;
    const base = import.meta.env.BASE_URL;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setMode('fallback');
      return;
    }

    document.documentElement.style.setProperty('--film-seam', manifest.seam);

    const jumpParam = new URLSearchParams(window.location.search).get('jump');
    let settleImmediately = jumpParam !== null;

    // ---- frame loading: concurrency-capped pump over a re-orderable queue ----
    const images: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let inFlight = 0;
    const PUMP_CONCURRENCY = 10;
    const pending: number[] = Array.from({ length: FRAME_COUNT }, (_, i) => i);

    function pump() {
      while (inFlight < PUMP_CONCURRENCY && pending.length > 0) {
        const i = pending.shift()!;
        const img = new Image();
        img.decoding = 'async';
        inFlight++;
        img.onload = () => {
          images[i] = img;
          loadedCount++;
          inFlight--;
          pump();
        };
        img.onerror = () => {
          inFlight--;
          loadedCount++; // count errors so the loader still completes
          pump();
        };
        img.src = frameUrl(base, i);
      }
    }
    pump();

    // When landing deep in the film (?jump), load frames nearest the target first.
    function prioritizeAround(target: number) {
      pending.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    }

    function nearestFrame(idx: number): HTMLImageElement | undefined {
      if (images[idx]) return images[idx];
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (images[idx - d]) return images[idx - d];
        if (images[idx + d]) return images[idx + d];
      }
      return undefined;
    }

    // ---- decode-warming window (the anti-jank core) ----
    // Frames are pre-decoded with img.decode() — Chrome's own off-thread
    // decoder — and drawn as plain images. No ImageBitmap objects are ever
    // created or closed: the create/close lifecycle under fast scrubbing
    // crashed the renderer ("Aw, Snap" error 11, a GPU use-after-free).
    // Chrome's image cache owns the decoded memory and self-evicts under
    // pressure; the worst case is a one-frame decode stutter, never a crash.
    const decoded = new Set<number>();
    const decoding = new Set<number>();
    const B_AHEAD = 12;
    let drawnIdx = -1; // last index we drew for…
    let drawnExact = false; // …and whether it was that frame's own pixels
    let drawnSrc: HTMLImageElement | undefined; // what actually painted

    // Runs every tick. Decodes are capped (nearest-to-playhead first) so a
    // fast scrub doesn't queue hundreds of decode requests at once.
    const DECODE_CONCURRENCY = 4;
    function ensureDecoded(center: number) {
      for (let d = 0; d <= B_AHEAD && decoding.size < DECODE_CONCURRENCY; d++) {
        for (const i of d === 0 ? [center] : [center - d, center + d]) {
          if (i < 0 || i >= FRAME_COUNT) continue;
          if (decoding.size >= DECODE_CONCURRENCY) break;
          const img = images[i];
          if (!img || decoded.has(i) || decoding.has(i)) continue;
          decoding.add(i);
          img
            .decode()
            .then(() => {
              decoding.delete(i);
              decoded.add(i);
              if (i === drawnIdx && !drawnExact) drawFrame(i, true);
            })
            .catch(() => {
              // decode() can reject transiently; the image is still drawable
              decoding.delete(i);
              decoded.add(i);
            });
        }
      }
    }

    // ---- canvas sizing (DPR capped at 1.5) ----
    let cw = 0;
    let ch = 0;
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (drawnIdx >= 0) drawFrame(drawnIdx, true);
    }
    window.addEventListener('resize', resize);
    resize();

    function drawFrame(idx: number, force = false) {
      // Only skip when the frame on screen is already this index's own pixels —
      // a fallback-neighbour draw must keep retrying until the real frame lands.
      if (!force && idx === drawnIdx && drawnExact) return;
      let src: HTMLImageElement | undefined;
      let exact = false;
      if (decoded.has(idx) && images[idx]) {
        src = images[idx];
        exact = true;
      }
      if (!src) {
        // A nearby pre-decoded frame draws without a sync decode — prefer it.
        for (let d = 1; d <= 4 && !src; d++) {
          if (decoded.has(idx - d) && images[idx - d]) src = images[idx - d];
          else if (decoded.has(idx + d) && images[idx + d]) src = images[idx + d];
        }
      }
      if (!src && images[idx]) {
        src = images[idx]; // parked with no warm window yet (e.g. ?jump landing)
        exact = true;
      }
      if (!src) src = nearestFrame(idx);
      if (!src) return;
      const iw = src.width;
      const ih = src.height;
      if (!iw || !ih) return;
      const s = Math.max(cw / iw, ch / ih);
      const dw = iw * s;
      const dh = ih * s;
      ctx!.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      drawnIdx = idx;
      drawnExact = exact;
      drawnSrc = src;
    }

    // ---- adaptive header: sample top-strip luminance every ~180ms ----
    const lumaCanvas = document.createElement('canvas');
    lumaCanvas.width = 16;
    lumaCanvas.height = 4;
    const lumaCtx = lumaCanvas.getContext('2d', { willReadFrequently: true });
    let lastLumaAt = 0;
    function sampleLuma(now: number) {
      // Sample from the small decoded source frame, never from the big GPU
      // canvas — frequent full-canvas readbacks can crash the renderer.
      const src = drawnSrc;
      if (!lumaCtx || now - lastLumaAt < 180 || !src) return;
      lastLumaAt = now;
      try {
        lumaCtx.drawImage(src, 0, 0, src.width, Math.max(1, src.height * 0.16), 0, 0, 16, 4);
        const d = lumaCtx.getImageData(0, 0, 16, 4).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) {
          sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        }
        const avg = sum / (d.length / 4);
        document.documentElement.classList.toggle('film-light', avg > 138);
      } catch {
        /* canvas may be briefly unreadable; skip this sample */
      }
    }

    // ---- the tick ----
    let currentFrame = 0;
    let lastP = 0;
    let rafId = 0;
    let readySet = false;
    let loaderDone = false;
    let prioritized = false;
    const beatEls = beatRefs.current;

    // Jank meter (dev contract): track rAF deltas, expose max for verify.js.
    let lastTick = 0;
    let jankMax = 0;
    const jankWindow: number[] = [];
    (window as unknown as { __jank: () => { max: number; p95: number } }).__jank = () => {
      const sorted = [...jankWindow].sort((a, b) => a - b);
      return {
        max: jankMax,
        p95: sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0,
      };
    };

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (lastTick > 0) {
        const delta = now - lastTick;
        jankMax = Math.max(jankMax, delta);
        jankWindow.push(delta);
        if (jankWindow.length > 600) jankWindow.shift();
      }
      lastTick = now;

      const r = driver!.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
      const dir = p >= lastP ? 1 : -1;
      lastP = p;

      const target = p * (FRAME_COUNT - 1);
      if (settleImmediately) {
        currentFrame = target;
        if (!prioritized) {
          prioritized = true;
          prioritizeAround(Math.round(target));
        }
        if (images[Math.round(target)]) settleImmediately = false;
      } else {
        currentFrame += (target - currentFrame) * 0.14;
        if (Math.abs(target - currentFrame) < 0.3) currentFrame = target;
      }
      const idx = Math.round(currentFrame);
      ensureDecoded(idx);
      drawFrame(idx);
      sampleLuma(now);

      // film-over: fixed chrome sits on footage until the driver has scrolled past
      document.documentElement.classList.toggle('film-over', r.bottom > 80 && r.top <= 0.5);

      // beats
      for (let i = 0; i < BEATS.length; i++) {
        const el = beatEls[i];
        if (!el) continue;
        const a = beatAlpha(BEATS[i], p);
        el.style.opacity = String(a);
        el.style.transform = `translateY(${(1 - a) * 22 * dir}px)`;
        el.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
      }

      // chapter readout
      const chapter = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
      if (readoutLabelRef.current) {
        const label = `0${chapter + 1} · ${CHAPTERS[chapter]}`;
        if (readoutLabelRef.current.textContent !== label) {
          readoutLabelRef.current.textContent = label;
        }
      }
      if (readoutBarRef.current) {
        readoutBarRef.current.style.transform = `scaleX(${p})`;
      }

      // handoff ramp over the last ~8%
      const ramp = Math.max(0, Math.min(1, (p - 0.92) / 0.08));
      if (fadeRef.current) fadeRef.current.style.opacity = String(ramp);
      if (grainRef.current) grainRef.current.style.opacity = String(1 - ramp);

      // loader
      if (!loaderDone) {
        const lp = loadedCount / FRAME_COUNT;
        if (loaderBarRef.current) loaderBarRef.current.style.transform = `scaleX(${lp})`;
        if (lp >= 1) {
          loaderDone = true;
          if (loaderRef.current) loaderRef.current.style.opacity = '0';
        }
      }

      // dev contract: __ready only once the intended frame's own pixels are drawn
      if (!readySet && !settleImmediately && drawnExact && drawnIdx === idx) {
        readySet = true;
        (window as unknown as { __ready: boolean }).__ready = true;
      }
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      decoded.clear();
      document.documentElement.classList.remove('film-over', 'film-light');
      document.documentElement.style.removeProperty('--film-seam');
    };
  }, [mode, manifest]);

  // Dev contract: the verification harness waits on window.__ready — it must
  // fire in fallback mode too, or captures of the film-less site would hang.
  useEffect(() => {
    if (mode !== 'fallback') return;
    const id = requestAnimationFrame(() => {
      (window as unknown as { __ready: boolean }).__ready = true;
    });
    return () => cancelAnimationFrame(id);
  }, [mode]);

  if (mode === 'fallback') return <Hero />;

  return (
    <section className="film-driver" ref={driverRef} aria-label="D2G Technology — intro film">
      <div className="film-stage">
        <canvas className="film-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="film-grain" ref={grainRef} aria-hidden="true" />
        <div className="film-vignette" aria-hidden="true" />
        <div className="film-fade-bottom" ref={fadeRef} aria-hidden="true" />

        {BEATS.map((beat, i) => (
          <div
            key={i}
            className={i === 0 || i === BEATS.length - 1 ? 'film-beat film-beat--scrim' : 'film-beat'}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
          >
            {beat.render()}
          </div>
        ))}

        <div className="film-readout" aria-hidden="true">
          <span ref={readoutLabelRef}>01 · {CHAPTERS[0]}</span>
          <div className="film-readout-bar">
            <div ref={readoutBarRef} />
          </div>
        </div>

        <div className="film-loader" ref={loaderRef} aria-hidden="true">
          <div ref={loaderBarRef} />
        </div>
      </div>
    </section>
  );
}
