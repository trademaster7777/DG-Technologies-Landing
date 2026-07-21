import React from 'react';
import { cn } from '@/lib/utils';
import logoMark from '@/assets/logo-mark.png';

interface LogoLockupProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

/**
 * Brand lockup: D2G mark image with a crisp white TECHNOLOGY line below.
 * The wordmark is real text (not raster) so it stays sharp at small sizes.
 */
export function LogoLockup({ className, markClassName, textClassName }: LogoLockupProps) {
  return (
    <span className={cn('inline-flex flex-col items-center', className)}>
      <img src={logoMark} alt="D2G" className={cn('w-auto', markClassName)} />
      <span
        className={cn(
          'font-semibold uppercase text-white leading-none tracking-[0.38em]',
          textClassName,
        )}
      >
        Technology
      </span>
    </span>
  );
}
