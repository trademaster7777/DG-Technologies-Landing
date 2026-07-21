import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';

export function FinalCTA() {
  return (
    <section id="book" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
      <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your website is <br className="hidden md:block" />
            <span className="text-gradient">one phone call away.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Book your free 30-minute discovery and strategy call. No pressure, no obligation — just a real conversation about your business and what a great website can do for it.
          </p>
          
          <div className="flex flex-col items-center">
            <MagneticButton href={BOOKING_URL} variant="primary" className="text-lg px-10 py-5 w-full md:w-auto shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              Book My Free Strategy Call
            </MagneticButton>
            <p className="mt-6 text-sm text-muted-foreground font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free 30-minute call · No commitment required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
