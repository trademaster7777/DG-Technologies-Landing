import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { MagneticButton } from './ui/MagneticButton';
import { BOOKING_URL } from '@/lib/booking';
import { cn } from '@/lib/utils';
import logoMark from '@/assets/logo-mark.png';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(scrollY.get() > 50);
    };
    const unsubscribe = scrollY.on('change', updateScroll);
    return () => unsubscribe();
  }, [scrollY]);

  const navItems = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-background/70 backdrop-blur-lg border-b border-white/10 py-4" : "bg-transparent py-6"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className="flex items-center" aria-label="DG Technologies — back to top">
          <img src={logoMark} alt="DG Technologies" className="h-9 md:h-11 w-auto" />
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href}
              className="text-sm font-medium text-white/85 hover:text-white transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <MagneticButton href={BOOKING_URL} variant="primary" className="hidden md:inline-flex px-6 py-2.5 text-sm">
          Book a Free Call
        </MagneticButton>

        {/* Mobile Nav Button (placeholder) */}
        <MagneticButton href={BOOKING_URL} variant="primary" className="md:hidden px-5 py-2 text-xs">
          Book Call
        </MagneticButton>
      </div>
    </motion.header>
  );
}
