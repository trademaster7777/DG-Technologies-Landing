import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';

export function Hero() {
  const headline = "Your Business Deserves to Be Found Online.";
  const words = headline.split(" ");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg opacity-70" />
      <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-50" />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        <motion.h1 
          className="font-extrabold tracking-tighter leading-[1.05] mb-6"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {words.map((word, i) => (
            <motion.span key={i} variants={item} className="inline-block mr-3 lg:mr-5">
              {word === "Found" || word === "Online." ? (
                <span className="text-gradient">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          We build clean, professional websites for small businesses, entrepreneurs, and solopreneurs — no tech skills required, no complicated process. Just a phone call, a plan, and a launch.
        </motion.p>

        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <MagneticButton href={BOOKING_URL} variant="primary" className="text-lg px-10 py-5">
            Book Your Free Strategy Call
          </MagneticButton>
          <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            See how it works ↓
          </a>
        </motion.div>

        {/* Trust Bar */}
        <motion.div 
          className="mt-20 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm md:text-base font-medium text-foreground/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {[
            "Flat fees starting at $999",
            "Done entirely over the phone",
            "Launched in days, not months"
          ].map((text, i) => (
            <motion.div 
              key={i}
              className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
