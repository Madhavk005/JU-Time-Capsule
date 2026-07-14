"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import Typewriter from 'typewriter-effect';

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      } 
    },
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden min-h-screen">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#F9F8F6]">
        <Image 
          src="/hero-bg.jpg" 
          alt="JECRC University Campus" 
          fill 
          priority
          className="object-cover object-center opacity-40 mix-blend-luminosity"
        />
        {/* Edge fading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F6] via-transparent to-[#F9F8F6]/50" />
        
        {/* Center Glow for Text Readability */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80vw] max-w-3xl h-[40vh] bg-[#F9F8F6]/80 blur-[80px] rounded-full" />
        </div>
      </div>

      {/* Refined Live Animated Mesh Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-multiply opacity-70">
        <motion.div 
          className="absolute -top-[10%] -right-[10%] w-[90vw] max-w-[1000px] h-[90vw] max-h-[1000px] rounded-full bg-amber-200/40 blur-[140px]"
          animate={{ x: [0, -50, 20, 0], y: [0, 50, -30, 0], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-[30%] -left-[10%] w-[70vw] max-w-[800px] h-[70vw] max-h-[800px] rounded-full bg-[#CD201F]/10 blur-[160px]"
          animate={{ x: [0, 100, -50, 0], y: [0, -80, 50, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
        />
      </div>
      
      <motion.div 
        className="max-w-4xl space-y-12 relative z-10 my-auto pt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-6 flex flex-col items-center">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-500">Class of 2026</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-serif text-[#1A1A1A] max-w-4xl leading-[1.05] tracking-tight drop-shadow-sm"
          >
            Welcome to the <br className="hidden sm:block" />
            <span className="text-primary italic font-[family-name:var(--font-cormorant)] font-semibold">JECRC Time Capsule.</span>
          </motion.h1>
        </div>
        
        <motion.div 
          variants={itemVariants}
          className="max-w-2xl mx-auto flex flex-col items-center gap-8 mt-8 px-4"
        >
          <p className="text-zinc-600 font-light text-xl md:text-2xl leading-relaxed text-center">
            Today, you are beginning a <span className="font-serif italic text-zinc-900 font-medium text-3xl md:text-4xl px-1">new chapter.</span>
          </p>

          <div className="h-[1px] w-12 bg-zinc-300 rounded-full" />

          <p className="text-zinc-500 font-light text-base md:text-lg leading-loose text-center">
            Before classes, assignments, friendships, and memories unfold, we invite you to leave a message for your future self.
          </p>

          <div className="font-serif italic text-2xl md:text-3xl text-primary font-medium text-center h-10 flex items-center justify-center">
            <Typewriter
              options={{
                strings: ['Dear Future Me...'],
                autoStart: true,
                loop: true,
                delay: 75,
                pauseFor: 3000,
              }}
            />
          </div>

          <p className="text-zinc-500 font-light text-sm md:text-base tracking-wide text-center max-w-lg mx-auto">
            Your responses will be <span className="text-zinc-900 font-medium">safely stored</span> and returned to you precisely during your graduation year.
          </p>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full px-4 sm:px-0"
        >
          <Link 
            href="/capsule" 
            className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-full px-10 h-14 sm:h-16 text-base sm:text-lg font-medium shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-primary/30 relative overflow-hidden group bg-[#1A1A1A] text-white border border-transparent"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start My Time Capsule
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-primary translate-y-[110%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1] z-0 rounded-full" />
          </Link>

        </motion.div>
      </motion.div>
    </main>
  );
}
