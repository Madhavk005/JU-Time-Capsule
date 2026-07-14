"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") || "2026";

  return (
    <main className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-60 pointer-events-none mix-blend-multiply" />
      
      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.05) 100%)" }} />

      <div className="max-w-3xl w-full z-10 flex flex-col items-center text-center space-y-10">
        
        {/* Animated Stamp */}
        <div className="relative flex items-center justify-center mb-16 w-80 h-80 md:w-96 md:h-96">
          {/* Target circle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1 }}
            className="absolute w-72 h-72 md:w-80 md:h-80 border-[3px] border-dashed border-red-900/20 rounded-full"
          />

          <motion.div
            initial={{ scale: 8, opacity: 0, rotate: 45 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            transition={{ type: "spring", damping: 14, stiffness: 220, delay: 0.3 }}
            className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center bg-transparent z-20 relative mix-blend-multiply"
          >
            {/* Thick Outer Ring */}
            <div className="absolute inset-0 border-[10px] md:border-[16px] border-[#CD201F] rounded-full" />
            
            {/* Thin Inner Ring */}
            <div className="absolute inset-[16px] md:inset-[24px] border-[2px] md:border-[3px] border-[#CD201F] rounded-full" />

            {/* Thick Inner Ring / Core */}
            <div className="absolute inset-[24px] md:inset-[34px] border-[5px] md:border-[8px] border-[#CD201F] rounded-full flex flex-col items-center justify-center bg-[#CD201F]/5 overflow-hidden">
               {/* Top Arc Text Area (Simulated) */}
               <span className="absolute top-6 md:top-10 text-[#CD201F] text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.5em] uppercase opacity-90">
                 Time Capsule
               </span>

               {/* Bottom Text */}
               <span className="absolute bottom-6 md:bottom-10 text-[#CD201F] text-xs sm:text-sm md:text-base font-black tracking-[0.3em] uppercase drop-shadow-sm">
                 Until {year}
               </span>
            </div>

            {/* Center Badge Bar (moved outside to prevent clipping) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] sm:w-[120%] h-[60px] sm:h-[80px] md:h-[100px] border-[4px] sm:border-[5px] md:border-[8px] border-[#CD201F] bg-[#F4F1EA] flex items-center justify-center shadow-sm -rotate-2 z-10 px-4">
              <span className="text-[#CD201F] text-4xl sm:text-6xl md:text-[5.5rem] font-black tracking-tight uppercase leading-none drop-shadow-sm whitespace-nowrap">
                 SEALED
              </span>
            </div>

            {/* Distressed Texture over everything */}
            <div className="absolute inset-[-15%] w-[130%] h-[130%] opacity-50 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] pointer-events-none rounded-full" />
          </motion.div>
          
          {/* Impact dust / shockwave */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="absolute w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 border-[4px] md:border-[6px] border-[#CD201F] rounded-full z-10"
          />
        </div>

        {/* Text content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] tracking-tight">
            Capsule Locked.
          </h1>
          <p className="text-zinc-600 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
            Your memories have been successfully archived in the university vault. This entry is now immutable and strictly confidential.
          </p>
        </motion.div>

        {/* Meta details */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-zinc-600 font-medium tracking-wide uppercase w-full"
        >
          <div className="flex items-center gap-2 bg-white/50 px-5 py-3 rounded-xl border border-zinc-200 shadow-sm backdrop-blur-md">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>Unlock Date: <strong className="text-zinc-900 font-bold">{year}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 px-5 py-3 rounded-xl border border-zinc-200 shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Status: <strong className="text-zinc-900 font-bold">Secured</strong></span>
          </div>
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="pt-8"
        >
          <Link href="/" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-12 font-bold text-[#F4F1EA] bg-[#1A1A1A] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <span className="tracking-widest uppercase text-sm">Return to Start</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F1EA]" />}>
      <SuccessContent />
    </Suspense>
  );
}
