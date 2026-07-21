import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene6_CTA() {
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtext(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Celebration burst background */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/celebration.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-25"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 0.25 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full opacity-30 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-[8vw] max-w-[1100px]">
        <motion.h2
          className="font-bold tracking-tight leading-[1.1] mb-[3vh]"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Book Your Free{' '}
          <span className="text-gradient">Strategy Call</span>
        </motion.h2>

        <motion.p
          className="font-semibold mb-[4vh]"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          30 minutes. No commitment. Real results.
        </motion.p>

        {/* CTA box - visual only, no interaction */}
        <motion.div
          className="inline-block px-[4vw] py-[2vh] rounded-2xl font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
            boxShadow: '0 0 40px rgba(59, 155, 246, 0.4)',
          }}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05 }}
        >
          Get Started Today
        </motion.div>

        {/* Fine print */}
        <motion.p
          className="font-medium mt-[2vh]"
          style={{
            fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
          }}
          initial={{ opacity: 0 }}
          animate={showSubtext ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          Book at D2GTechnology.com
        </motion.p>
      </div>

      {/* Pulsing glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 155, 246, 0.1), transparent 60%)',
        }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
