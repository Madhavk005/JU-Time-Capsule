"use client";

import Link from 'next/link';

export function Navbar() {
  return (
    <header className="absolute top-0 w-full z-50 py-4 px-6 md:py-6 md:px-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity z-50 relative">
        <img 
          src="/jecrc-logo-4x.png" 
          alt="JECRC University" 
          className="object-contain h-24 sm:h-28 md:h-32 w-auto max-w-[70vw]"
        />
      </Link>
      

    </header>
  );
}
