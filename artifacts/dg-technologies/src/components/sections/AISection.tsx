import React from 'react';
import { motion } from 'framer-motion';

// Concrete, small-business examples of what an AI setup can do.
const AI_EXAMPLES = [
  'Custom AI Agents',
  'Company Knowledge Base',
  'Draft your emails, quotes, and posts',
];

/**
 * Subtle AI consulting upsell. Intentionally lighter-weight than the core
 * sections — the site stays website-first, this is a "by the way" nudge
 * that routes curiosity into the same strategy call.
 */
export function AISection() {
  return (
    <section id="ai" className="py-24 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <motion.div
          className="glass-card max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center border-foreground/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle shine effect inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-foreground/0 via-foreground/5 to-foreground/0 opacity-50 pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6 text-xs font-semibold tracking-[0.25em] uppercase text-primary">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.9 5.7a2 2 0 001.27 1.27L20.9 10.8a.6.6 0 010 1.14l-5.73 1.9a2 2 0 00-1.27 1.27L12 20.84a.6.6 0 01-1.14 0l-1.9-5.73a2 2 0 00-1.27-1.27l-5.73-1.9a.6.6 0 010-1.14l5.73-1.9a2 2 0 001.27-1.27L11.43 2A.6.6 0 0112 2z" />
              </svg>
              AI
            </span>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Websites first. AI when you're ready.
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              Your website comes first — that's the foundation, and it's what we do best. But
              if you've been wondering what AI could actually do for a business like yours,
              bring it up on your call. We'll tell you what's worth setting up, what isn't,
              and if you want it, we'll handle it the same way we handle your website — done
              for you, explained in plain English.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {AI_EXAMPLES.map((example) => (
                <span
                  key={example}
                  className="inline-flex items-center gap-2.5 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm text-foreground/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent shrink-0" aria-hidden="true" />
                  {example}
                </span>
              ))}
            </div>

            <a
              href="#book"
              className="group inline-flex items-center gap-2 font-semibold text-[hsl(var(--link))] hover:text-[hsl(var(--link-hover))] transition-colors"
            >
              Ask about AI on your free strategy call
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
