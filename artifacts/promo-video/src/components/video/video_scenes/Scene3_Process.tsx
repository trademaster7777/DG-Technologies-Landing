import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3_Process() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Background with phone call illustration */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 155, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
          backgroundColor: 'var(--color-bg-dark)',
        }}
      />

      {/* Decorative image - phone call */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/phone-call.png`}
        alt=""
        className="absolute right-[5vw] top-[50%] -translate-y-1/2 opacity-20"
        style={{
          width: 'clamp(200px, 30vw, 400px)',
          height: 'auto',
        }}
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 0.2, x: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content */}
      <div className="relative z-10 px-[8vw] max-w-[1400px] w-full">
        {/* Title */}
        <motion.h2
          className="font-bold tracking-tight mb-[5vh]"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          The entire process:
        </motion.h2>

        {/* Steps */}
        <div className="space-y-[3vh]">
          {/* Step 1 */}
          <motion.div
            className="flex items-center gap-[2vw]"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div 
              className="flex-shrink-0 w-[4vw] h-[4vw] min-w-[50px] min-h-[50px] max-w-[80px] max-h-[80px] rounded-full flex items-center justify-center font-bold"
              style={{
                background: step >= 1 ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--color-bg-card)',
                fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              1
            </div>
            <div>
              <p 
                className="font-bold"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                30-minute strategy call
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="ml-[2vw] pl-[25px]"
            initial={{ opacity: 0 }}
            animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className="text-[var(--color-primary)]">
              <path d="M12 0L12 36M12 36L6 30M12 36L18 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="flex items-center gap-[2vw]"
            initial={{ opacity: 0, x: -40 }}
            animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div 
              className="flex-shrink-0 w-[4vw] h-[4vw] min-w-[50px] min-h-[50px] max-w-[80px] max-h-[80px] rounded-full flex items-center justify-center font-bold"
              style={{
                background: step >= 2 ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--color-bg-card)',
                fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              2
            </div>
            <div>
              <p 
                className="font-bold"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                We build your draft
              </p>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="ml-[2vw] pl-[25px]"
            initial={{ opacity: 0 }}
            animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className="text-[var(--color-primary)]">
              <path d="M12 0L12 36M12 36L6 30M12 36L18 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="flex items-center gap-[2vw]"
            initial={{ opacity: 0, x: -40 }}
            animate={step >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div 
              className="flex-shrink-0 w-[4vw] h-[4vw] min-w-[50px] min-h-[50px] max-w-[80px] max-h-[80px] rounded-full flex items-center justify-center font-bold"
              style={{
                background: step >= 3 ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--color-bg-card)',
                fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              3
            </div>
            <div>
              <p 
                className="font-bold text-gradient"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                You launch
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
