import { motion } from 'framer-motion';

export function Scene7_Outro() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Simple dark background with subtle gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 155, 246, 0.1), transparent 70%)',
          backgroundColor: 'var(--color-bg-dark)',
        }}
      />

      {/* Floating orb */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-20 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.2 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Logo lockup */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img 
          src={`${import.meta.env.BASE_URL}assets/logo-full-white.png`}
          alt="D2G Technology"
          className="h-[10vh] w-auto mx-auto mb-[2vh]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <motion.p
          className="font-semibold"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Professional websites for small business
        </motion.p>
      </motion.div>

      {/* Exit animation preparation for loop */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--color-bg-dark)',
        }}
      />
    </div>
  );
}
