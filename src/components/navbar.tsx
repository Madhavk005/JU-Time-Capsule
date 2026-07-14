"use client";

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="absolute top-0 w-full z-50 py-4 px-6 md:py-6 md:px-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity z-50 relative">
        <Image 
          src="/jecrc-logo-4x.png" 
          alt="JECRC University" 
          width={400}
          height={128}
          className="object-contain h-24 sm:h-28 md:h-32 w-auto max-w-[70vw]"
          priority
        />
      </Link>
      

    </header>
  );
}
