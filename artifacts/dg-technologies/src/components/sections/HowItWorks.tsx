import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';
import { cn } from '@/lib/utils';

const steps = [
  {
    num: 1,
    title: "Discovery & Strategy Call (30 minutes)",
    desc: "We get on the phone and learn your business: who you serve, what makes you different, and what you need your website to do. No forms, no homework. Just a conversation."
  },
  {
    num: 2,
    title: "We Build Your First Draft",
    desc: "Our team gets to work turning that conversation into a professional website designed to win you customers. You do nothing but wait for the reveal."
  },
  {
    num: 3,
    title: "Feedback Call",
    desc: "We walk through the draft together on a second call. You tell us what to tweak — copy, colors, layout, anything — and we make the adjustments."
  },
  {
    num: 4,
    title: "Launch & Handoff",
    desc: "Your website goes live. We hand you the keys and make sure you're fully equipped to manage your online presence going forward. No dependency, no lock-in."
  }
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Four steps to your new online presence.</p>
        </motion.div>

        <div className="relative" ref={containerRef}>
          {/* Central Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -ml-[1px] bg-foreground/10 hidden md:block" />
          <motion.div 
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -ml-[1px] bg-gradient-to-b from-primary to-accent hidden md:block origin-top"
            style={{ scaleY: pathLength }}
          />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, i) => (
              <div key={i} className={cn("relative flex items-center md:justify-between flex-col md:flex-row", i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse")}>
                
                {/* Desktop layout half-width spacer */}
                <div className="hidden md:block w-1/2" />
                
                {/* Node */}
                <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 -ml-3 md:-ml-[18px] md:-mt-[18px] w-6 h-6 md:w-9 md:h-9 rounded-full bg-background border border-foreground/20 flex items-center justify-center z-10 hidden md:flex">
                  <motion.div 
                    className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  />
                </div>

                <motion.div 
                  className="w-full md:w-[45%] pl-12 md:pl-0"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <div className="glass-card p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(20,25,50,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-shadow group relative overflow-hidden">
                    <div
                      className="absolute top-0 right-0 p-6 opacity-10 font-bold text-6xl"
                      data-parallax="0.1"
                    >
                      0{step.num}
                    </div>
                    <div className="text-primary font-mono text-sm font-semibold tracking-wider mb-2">STEP {step.num}</div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <MagneticButton href={BOOKING_URL} variant="primary" className="text-lg">
            Start With Step 1 — Book Your Free Call
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
