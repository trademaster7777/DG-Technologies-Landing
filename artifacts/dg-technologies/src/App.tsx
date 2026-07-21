import { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Lenis from 'lenis';
import { MotionConfig } from 'framer-motion';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

import { Hero } from '@/components/sections/Hero';
import { Problem } from '@/components/sections/Problem';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { WhyUs } from '@/components/sections/WhyUs';
import { Pricing } from '@/components/sections/Pricing';
import { Testimonials } from '@/components/sections/Testimonials';
import { Upsell } from '@/components/sections/Upsell';
import { FAQSection } from '@/components/sections/FAQSection';
import { FinalCTA } from '@/components/sections/FinalCTA';

function LandingPage() {
  // Initialize smooth scrolling with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Route same-page anchor clicks through Lenis for smooth scrolling
    function onAnchorClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = (e.target as HTMLElement).closest('a[href*="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      const url = new URL(href, window.location.href);
      // Only intercept links to an anchor on this same page
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
        return;
      }
      if (url.hash.length <= 1) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
      if (window.location.hash !== url.hash) {
        history.pushState(null, '', url.hash);
      }
    }
    document.addEventListener('click', onAnchorClick);

    // If the page is loaded with a hash (e.g. a shared /#book link), land on it
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        requestAnimationFrame(() => {
          lenis.scrollTo(el as HTMLElement, { immediate: true, offset: -72 });
        });
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onAnchorClick);
      lenis.destroy();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background min-h-screen text-foreground selection:bg-primary/30">
        <ScrollProgress />
        <Header />
        <main>
          <Hero />
          <Problem />
          <HowItWorks />
          <WhyUs />
          <Pricing />
          <Testimonials />
          <Upsell />
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Switch>
        <Route path="/" component={LandingPage} />
        {/* Fallback to root for any other path since it's a SPA */}
        <Route component={LandingPage} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
