import React from 'react';

export function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/5 py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tighter text-white/90">
            DG Technologies
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground border-t border-white/5 pt-8">
          <p>© 2026 DG Technologies. All rights reserved.</p>
          <p>Built for small businesses, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
