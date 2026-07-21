import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const benefits = [
  { text: 'Done entirely over the phone', delay: 0 },
  { text: 'Launched in days, not months', delay: 0.8 },
  { text: 'You own it — no lock-in', delay: 1.6 },
];

export function Scene4_Benefits() {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    const timers = benefits.map((benefit, i) =>
      setTimeout(() => setVisible(prev => [...prev, i]), benefit.delay * 1000)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Tech connection background image */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/tech-connection.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, var(--color-bg-dark) 70%)',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full opacity-20 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          top: '10%',
          right: '10%',
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 px-[8vw] max-w-[1200px]">
        <motion.h2
          className="font-bold tracking-tight mb-[6vh] text-center"
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Why choose <span className="text-gradient">D2G</span>?
        </motion.h2>

        <div className="space-y-[3vh]">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-[2vw] px-[3vw] py-[2vh] rounded-2xl"
              style={{
                background: visible.includes(i) ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: visible.includes(i) ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
              }}
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={visible.includes(i) ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Checkmark */}
              <motion.div
                className="flex-shrink-0 w-[3vw] h-[3vw] min-w-[40px] min-h-[40px] max-w-[60px] max-h-[60px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                }}
                initial={{ scale: 0 }}
                animate={visible.includes(i) ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>

              {/* Text */}
              <p
                className="font-bold"
                style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {benefit.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
