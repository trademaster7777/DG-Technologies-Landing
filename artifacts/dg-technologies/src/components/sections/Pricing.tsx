import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';
import { cn } from '@/lib/utils';

function CountUp({ to, duration = 2 }: { to: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const stepTime = Math.abs(Math.floor(duration * 1000 / to));
      const timer = setInterval(() => {
        start += Math.ceil(to / 50); // fast count up
        if (start > to) start = to;
        setCount(start);
        if (start === to) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [isInView, to, duration]);

  return <span ref={ref}>${count}</span>;
}

export function Pricing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, flat-fee pricing.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hourly billing. No surprise invoices. One price, one finished website.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1: Launchpad */}
          <motion.div variants={item} className="glass-card rounded-3xl p-8 md:p-10 order-2 md:order-1 h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-2">The Launchpad</h3>
            <div className="text-5xl font-extrabold mb-6 tracking-tight">
              <CountUp to={999} />
            </div>
            <p className="text-muted-foreground mb-8 min-h-[60px]">
              A precision-engineered, single-page landing site designed strictly to convert visitors into leads.
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Custom High-Converting Landing Page",
                "Mobile-First Responsive Design",
                "Premium Branding Integration",
                "Lead Capture Form Integration",
                "Basic SEO Optimization",
                "1 Round of Revisions"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-foreground/80 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <MagneticButton href={BOOKING_URL} variant="outline" className="w-full text-center py-4">
              Select Launchpad
            </MagneticButton>
          </motion.div>

          {/* Card 2: Presence */}
          <motion.div variants={item} className="relative rounded-3xl p-[2px] overflow-hidden order-1 md:order-2 h-[105%] flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-50 animate-[spin_4s_linear_infinite] scale-[2.0]" />
            <div className="absolute inset-0 bg-background/90 rounded-3xl backdrop-blur-3xl m-[1px]" />
            
            <div className="relative z-10 bg-background/75 dark:bg-black/40 rounded-3xl p-8 md:p-10 h-full flex flex-col">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)] tracking-wider">
                  MOST POPULAR
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">The Presence</h3>
              <div className="text-5xl font-extrabold mb-6 tracking-tight text-gradient">
                <CountUp to={1499} />
              </div>
              <p className="text-muted-foreground mb-8 min-h-[60px]">
                A comprehensive 3-page website establishing serious authority and trust for your business.
              </p>
              
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "Full 3-Page Website (e.g., Home, About, Services)",
                  "Bespoke Premium Design",
                  "Advanced Lead Capture & Contact Forms",
                  "Performance & Speed Optimization",
                  "Comprehensive On-Page SEO",
                  "2 Rounds of Revisions",
                  "Priority Support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/90 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton href={BOOKING_URL} variant="primary" className="w-full text-center py-4">
                Select Presence
              </MagneticButton>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
