import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2_Problem() {
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowLine2(true), 700),
      setTimeout(() => setShowLine3(true), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 155, 246, 0.08), transparent 60%), radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.08), transparent 60%)',
          backgroundColor: 'var(--color-bg-dark)',
        }}
      />

      {/* Floating accent shape */}
      <motion.div
        className="absolute w-[25vw] h-[25vw] rounded-full border border-[var(--color-primary)] opacity-10"
        initial={{ x: '-30vw', y: '20vh', scale: 0.5, opacity: 0 }}
        animate={{ 
          x: '-15vw', 
          y: '10vh', 
          scale: 1,
          opacity: 0.1,
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-[10vw] max-w-[1200px]">
        {/* Headline - always rendered, controlled by animate */}
        <motion.h2
          className="font-bold tracking-tight leading-[1.15] mb-[2vh]"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          You're great at what you do.
        </motion.h2>

        {/* Supporting lines - always rendered, animate controlled */}
        <motion.p
          className="font-semibold leading-relaxed"
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.6rem)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={showLine2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          But building a website?
        </motion.p>

        <motion.p
          className="font-bold mt-[2vh] text-gradient"
          style={{
            fontSize: 'clamp(1.2rem, 2.8vw, 2rem)',
            fontFamily: 'var(--font-display)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={showLine3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          There's a simpler way.
        </motion.p>
      </div>

      {/* Accent line that draws across */}
      <motion.div
        className="absolute bottom-[15vh] left-[10vw] right-[10vw] h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          transformOrigin: 'left',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
