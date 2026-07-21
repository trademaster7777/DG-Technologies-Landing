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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background min-h-screen text-foreground selection:bg-primary/30 selection:text-white">
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
