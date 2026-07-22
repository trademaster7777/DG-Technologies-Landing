import React from 'react';
import { LogoLockup } from './ui/LogoLockup';

export function Footer() {
  return (
    <footer className="bg-foreground/[0.03] dark:bg-black/50 border-t border-foreground/5 py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <LogoLockup markClassName="h-10" textClassName="mt-1.5 text-[10px]" />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground border-t border-foreground/5 pt-8">
          <p>© 2026 D2G Technology. All rights reserved.</p>
          <p>Built for small businesses, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
