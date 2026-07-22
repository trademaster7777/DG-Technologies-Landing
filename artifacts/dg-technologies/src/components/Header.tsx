import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { MagneticButton } from './ui/MagneticButton';
import { LogoLockup } from './ui/LogoLockup';
import { ThemeToggle } from './ui/ThemeToggle';
import { BOOKING_URL } from '@/lib/booking';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(scrollY.get() > 50);
    };
    const unsubscribe = scrollY.on('change', updateScroll);
    return () => unsubscribe();
  }, [scrollY]);

  // While the menu is open: close it if the viewport grows past the mobile
  // breakpoint (e.g. phone rotation), and let Escape close it with focus
  // returned to the toggle button.
  useEffect(() => {
    if (!menuOpen) return;

    const mq = window.matchMedia('(min-width: 768px)');
    const onBreakpointChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    onBreakpointChange();
    mq.addEventListener('change', onBreakpointChange);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      mq.removeEventListener('change', onBreakpointChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

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
        isScrolled || menuOpen
          ? "bg-background/80 backdrop-blur-lg border-b border-border py-4"
          : "bg-transparent py-6"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className="flex items-center" aria-label="D2G Technology — back to top">
          <LogoLockup
            markClassName="h-7 md:h-8"
            textClassName="mt-1 text-[8px] md:text-[9px]"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/85 hover:text-foreground transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <MagneticButton href={BOOKING_URL} variant="primary" className="px-6 py-2.5 text-sm">
            Book a Free Call
          </MagneticButton>
        </div>

        {/* Mobile: compact CTA + menu toggle */}
        <div className="flex md:hidden items-center gap-3">
          <MagneticButton href={BOOKING_URL} variant="primary" className="px-5 py-2.5 text-xs">
            Book Call
          </MagneticButton>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-foreground active:bg-foreground/10 transition-colors"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            className="md:hidden absolute top-full left-0 right-0 overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="container mx-auto px-4 pt-2 pb-5 flex flex-col">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 text-base font-medium text-foreground/90 border-b border-foreground/5"
                >
                  {item.name}
                </a>
              ))}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-base font-medium text-foreground/90">Appearance</span>
                <ThemeToggle className="h-11 w-11" />
              </div>
              <a
                href={BOOKING_URL}
                onClick={() => setMenuOpen(false)}
                className="mt-4 rounded-full bg-gradient-to-r from-primary to-accent text-white text-center font-semibold py-3.5"
              >
                Book a Free Call
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
