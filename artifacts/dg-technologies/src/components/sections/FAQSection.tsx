import React from 'react';
import { motion } from 'framer-motion';
import { Accordion } from '../ui/FaqAccordion';

const faqItems = [
  {
    question: "How much does a website cost?",
    answer: "Simple flat fees: The Launchpad (single-page site) is $999 and The Presence (full 3-page website) is $1,499. No hourly billing, no surprises — we'll confirm the right fit on your free strategy call."
  },
  {
    question: "How long does it take?",
    answer: "Most projects follow our simple rhythm: strategy call, first draft, feedback call, launch. For most clients, that means going live in days or weeks — not months."
  },
  {
    question: "Do I need to be tech-savvy?",
    answer: "Not at all. The entire process happens over the phone, and at handoff we make sure you're comfortable managing your site going forward."
  },
  {
    question: "What do you need from me?",
    answer: "Just 30 minutes for the first call. We'll tell you if there's anything else (like photos or your logo) as we go."
  },
  {
    question: "What if I already have a website?",
    answer: "Great — we can rebuild or refresh it. The process is exactly the same, starting with a strategy call."
  },
  {
    question: "What happens after launch?",
    answer: "The website is yours. We equip you to manage it yourself — and we're a phone call away if you ever want help or upgrades."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Accordion items={faqItems} />
        </motion.div>
      </div>
    </section>
  );
}
