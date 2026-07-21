import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5_Pricing() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 155, 246, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)',
          backgroundColor: 'var(--color-bg-dark)',
        }}
      />

      {/* Website mockup in background */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/website-mockup.png`}
        alt=""
        className="absolute left-[-10vw] top-[50%] -translate-y-1/2 opacity-10"
        style={{
          width: 'clamp(300px, 40vw, 600px)',
          height: 'auto',
        }}
        initial={{ opacity: 0, x: -100, scale: 0.8 }}
        animate={{ opacity: 0.1, x: 0, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content */}
      <div className="relative z-10 px-[6vw] w-full max-w-[1400px]">
        {/* Title */}
        <motion.h2
          className="font-bold tracking-tight mb-[5vh] text-center"
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Simple, flat-fee pricing
        </motion.h2>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-[3vw] max-w-[1000px] mx-auto">
          {/* The Launchpad */}
          <motion.div
            className="rounded-2xl p-[2vw] min-p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={showCards ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p 
              className="font-bold mb-[1vh]"
              style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              The Launchpad
            </p>
            <p 
              className="font-bold text-gradient mb-[2vh]"
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontFamily: 'var(--font-display)',
              }}
            >
              $999
            </p>
            <p 
              className="font-medium"
              style={{
                fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              Single-page landing site
            </p>
          </motion.div>

          {/* The Presence - featured */}
          <motion.div
            className="rounded-2xl p-[2vw] min-p-8 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 0 2px var(--color-primary), 0 0 40px rgba(59, 155, 246, 0.3)',
            }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={showCards ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Most Popular badge */}
            <div 
              className="absolute top-[-12px] left-1/2 -translate-x-1/2 px-[1.5vw] py-[0.5vh] rounded-full text-xs font-bold whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                fontSize: 'clamp(0.65rem, 1.1vw, 0.85rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              MOST POPULAR
            </div>

            <p 
              className="font-bold mb-[1vh]"
              style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              The Presence
            </p>
            <p 
              className="font-bold text-gradient mb-[2vh]"
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontFamily: 'var(--font-display)',
              }}
            >
              $1,499
            </p>
            <p 
              className="font-medium"
              style={{
                fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              Full 3-page website
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
