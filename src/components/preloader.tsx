"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(2024); // Starting year

  useEffect(() => {
    // Animate the year counting up to 2026
    const sequence = [
      { y: 2024, delay: 0 },
      { y: 2025, delay: 600 },
      { y: 2026, delay: 1200 }
    ];

    sequence.forEach(({ y, delay }) => {
      setTimeout(() => setYear(y), delay);
    });

    // End preloader after sequence completes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F9F8F6]"
        >
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo fading in above */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <Image
                src="/jecrc-logo-4x.png"
                alt="JECRC University"
                width={160}
                height={160}
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Year Counter */}
            <div className="h-24 overflow-hidden relative w-64 flex justify-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={year}
                  initial={{ y: 50, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -50, opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="font-serif text-6xl md:text-7xl font-medium tracking-tight text-[#1A1A1A] absolute"
                >
                  {year}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thematic subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 flex items-center gap-3 text-zinc-500 font-light tracking-wide uppercase text-xs"
            >
              <div className="w-8 h-px bg-zinc-300" />
              Fast-forwarding time
              <div className="w-8 h-px bg-zinc-300" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
