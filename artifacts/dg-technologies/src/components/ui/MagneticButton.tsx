import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, variant = "primary", as, href, ...props }, ref) => {
    const Component = as || (href ? "a" : "button");
    const localRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!localRef.current) return;
      const { clientX, clientY } = e;
      const { height, width, left, top } = localRef.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      
      // Reduce magnetic pull slightly
      x.set(middleX * 0.2);
      y.set(middleY * 0.2);
    };

    const reset = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    };

    const variants = {
      primary: "bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/10",
      secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
      outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
      ghost: "bg-transparent text-white hover:bg-white/5"
    };

    return (
      <motion.div
        ref={localRef as any}
        style={{ x, y }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={reset}
        className="inline-block"
      >
        <Component
          ref={ref}
          href={href}
          className={cn(
            "relative inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-colors duration-300 overflow-hidden group",
            variants[variant],
            className
          )}
          {...props}
        >
          {variant === 'primary' && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          )}
          <span className="relative z-10">{children}</span>
        </Component>
      </motion.div>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
