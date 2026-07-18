import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { CustomCursor } from "@/components/custom-cursor";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "JECRC Time Capsule 2026",
  description: "A premium digital memory vault for your future self.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-[#CD201F]/20 scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} ${playfair.variable} ${cormorant.variable} font-sans min-h-full flex flex-col bg-[#F9F8F6] text-[#1A1A1A]`}>
        <CustomCursor />
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply z-50"></div>
        <Navbar />
        {children}
        <Footer />

        <Toaster theme="light" />
      </body>
    </html>
  );
}
