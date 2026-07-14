"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Smooth springs for the trailing ring
  const springX = useSpring(0, { stiffness: 800, damping: 40 });
  const springY = useSpring(0, { stiffness: 800, damping: 40 });

  useEffect(() => {
    // Only run on devices with a fine pointer (mouse)
    if (window.matchMedia("(hover: none)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX);
      springY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('label') ||
        target.closest('[role="button"]')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleClick = (e: MouseEvent) => {
      // Create a new ripple at the click coordinates
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, newRipple]);
      
      // Clean up the ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseLeave);
    window.addEventListener("click", handleClick);
    
    // Add a class to body to hide default cursor
    document.body.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [springX, springY, isVisible]);

  // Don't render component at all on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
    return null;
  }

  return (
    <>
      {/* Expanding Interactive Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="fixed w-16 h-16 border-[3px] border-[#CD201F] rounded-full pointer-events-none z-[9998]"
            style={{ left: ripple.x - 32, top: ripple.y - 32 }}
          />
        ))}
      </AnimatePresence>

      {/* Solid Center Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[#CD201F] rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.05 }}
      />
      
      {/* Smooth Trailing Spring Ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-[1.5px] border-[#CD201F]/60 rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-multiply"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? "rgba(205, 32, 31, 0.1)" : "rgba(205, 32, 31, 0)",
          opacity: isVisible ? 1 : 0,
          borderColor: isHovering ? "rgba(205, 32, 31, 0)" : "rgba(205, 32, 31, 0.6)",
        }}
        transition={{ scale: { duration: 0.3 }, backgroundColor: { duration: 0.3 }, borderColor: { duration: 0.3 } }}
      />
    </>
  );
}
