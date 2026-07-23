import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires Lenis and GSAP ScrollTrigger into one clock: Lenis raf runs on the
 * gsap ticker, and every Lenis scroll updates ScrollTrigger. Returns cleanup.
 */
export function wireLenisScrollTrigger(lenis: Lenis): () => void {
  lenis.on('scroll', ScrollTrigger.update);
  const tickerFn = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tickerFn);
  };
}

/**
 * Data-attribute driven scroll-film motion for the after-film sections.
 * Ordering law: no pinned scenes exist (the film hero uses CSS sticky), so
 * these ambient triggers are safe to create in any order — but if a GSAP pin
 * is ever added, it must be created BEFORE this runs.
 *
 *   data-parallax="0.15"  — element drifts vertically against scroll (scrubbed)
 *   data-clip-reveal      — element reveals top-to-bottom via clip-path (scrubbed)
 *   data-skew             — element skews with scroll velocity, settles back
 */
export function initSectionMotion(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || '0.15');
      const trigger = el.closest('section') ?? el;
      gsap.fromTo(
        el,
        { y: () => speed * 220 },
        {
          y: () => -speed * 220,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    document.querySelectorAll<HTMLElement>('[data-clip-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 55%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    document.querySelectorAll<HTMLElement>('[data-skew]').forEach((el) => {
      const proxy = { skew: 0 };
      const setter = gsap.quickSetter(el, 'skewY', 'deg');
      el.style.willChange = 'transform';
      ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / -400);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.7,
              ease: 'power3',
              overwrite: true,
              onUpdate: () => setter(proxy.skew),
            });
          }
        },
      });
    });
  });

  return () => ctx.revert();
}

/**
 * Dev contract for the verification harness: with ?jump=<scrollY> in the URL
 * the page lands pre-scrolled with all scroll state force-settled. Returns the
 * jump target, or null when absent. Call after triggers are created.
 */
export function applyJumpContract(): number | null {
  const raw = new URLSearchParams(window.location.search).get('jump');
  if (raw === null) return null;
  const y = Number(raw) || 0;
  history.scrollRestoration = 'manual';
  window.scrollTo(0, y);
  ScrollTrigger.refresh();
  window.scrollTo(0, y);
  ScrollTrigger.update();
  return y;
}
