import React from 'react';
import { motion } from 'framer-motion';

export function Upsell() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <motion.div 
          className="glass-card max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center border-white/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle shine effect inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-50" />
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Ready for more than a website?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            A website is your front door. For businesses that want to go further, we also set up practical AI tools — automated responses, booking, and customer follow-up — so your online presence works even when you're off the clock. Ask us about it on your strategy call.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
