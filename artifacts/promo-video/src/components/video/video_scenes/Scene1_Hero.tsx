import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1_Hero() {
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTagline(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Animated gradient orbs background */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
        }}
        initial={{ x: '-20vw', y: '10vh', scale: 0.8 }}
        animate={{ 
          x: '-10vw', 
          y: '-5vh', 
          scale: 1.2,
        }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute w-[35vw] h-[35vw] rounded-full opacity-25 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        }}
        initial={{ x: '20vw', y: '-10vh', scale: 0.8 }}
        animate={{ 
          x: '15vw', 
          y: '5vh', 
          scale: 1.1,
        }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-[8vw]">
        {/* Logo reveal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-[3vh]"
        >
          <img 
            src={`${import.meta.env.BASE_URL}assets/logo-full-white.png`}
            alt="D2G Technology"
            className="h-[8vh] w-auto mx-auto"
          />
        </motion.div>

        {/* Hook headline with staggered word reveal */}
        <motion.h1
          className="font-bold tracking-tight leading-[1.1]"
          style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Your{' '}
          </motion.span>
          <motion.span
            className="inline-block text-gradient"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Website
          </motion.span>
          <br />
          <motion.span
            className="inline-block"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            is One{' '}
          </motion.span>
          <motion.span
            className="inline-block text-gradient"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Phone Call
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {' '}Away
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="font-semibold tracking-wide mt-[3vh]"
          style={{
            fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={showTagline ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Professional websites for small business
        </motion.p>
      </div>

      {/* Exit animation - scale up and fade */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        exit={{ opacity: 0.15, scale: 1.5 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
