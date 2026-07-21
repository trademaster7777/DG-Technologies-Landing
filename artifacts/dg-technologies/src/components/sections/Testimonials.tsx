import React from 'react';
import { motion } from 'framer-motion';

// Swap or add entries here — each card renders from this list.
const TESTIMONIALS = [
  {
    quote:
      "I put off getting a website for three years because I didn't have time to learn any of it. Two phone calls with these guys and my salon had a site that looks better than the fancy place across town. Clients book with me now because we look legit.",
    name: 'Danielle Reyes',
    business: 'Owner, Luxe & Co. Hair Studio',
    initials: 'DR',
  },
  {
    quote:
      "I'm a plumber, not a computer guy. They just called me, asked smart questions about my business, and built the whole thing while I was on jobs. It went live in under two weeks and I've already had customers say they found me online.",
    name: 'Mike Kowalski',
    business: 'Kowalski Plumbing & Drain',
    initials: 'MK',
  },
  {
    quote:
      "As a one-person consulting shop, agencies quoted me $8,000 and months of meetings. DG got me a sharp, professional site for a flat fee — and when we were done, they handed me the keys. No retainers, no runaround.",
    name: 'Priya Natarajan',
    business: 'Founder, Clearpath HR Consulting',
    initials: 'PN',
  },
];

export function Testimonials() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_60%)]" />
      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Trusted by those who do the work.</h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div 
              key={t.name} 
              variants={item}
              className="glass-card p-8 md:p-10 rounded-2xl relative"
            >
              <div className="text-primary opacity-20 absolute top-6 right-8">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-lg text-white/95 leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center text-white/80 font-semibold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.business}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
