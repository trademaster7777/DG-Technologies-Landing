import React from 'react';
import { motion } from 'framer-motion';

export function Problem() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            You're great at what you do. <br className="hidden md:block" />
            <span className="text-gradient">Your website should say so.</span>
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>
              Most small business owners know they need a real online presence — but between running the business, serving customers, and everything else, building a website falls to the bottom of the list.
            </p>
            <p>
              DIY builders eat your weekends. Agencies quote you thousands and bury you in jargon. There's a simpler way.
            </p>
            <p className="text-white font-medium text-xl md:text-2xl mt-8">
              You talk. We build. You launch.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
