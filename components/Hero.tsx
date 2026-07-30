"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useState, MouseEvent } from "react";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    // Calculate mouse position relative to center of screen (-1 to 1)
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    // Limit parallax translation to max 15px
    setMousePos({ x: x * 15, y: y * 15 });
  };

  return (
    <section 
      className="relative pt-20 pb-20 sm:pt-24 sm:pb-24 overflow-hidden hero-wave-section text-center min-h-[80vh] flex items-center" 
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      onMouseMove={handleMouseMove}
    >
      <div className="hero-wave" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Shooting Stars (Visible only in dark mode) */}
      <div 
        className="shooting-star-container" 
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      >
        <div className="shooting-star" style={{ top: '15%', left: '70%', animationDelay: '0s', animationDuration: '5s' }}></div>
        <div className="shooting-star" style={{ top: '5%', left: '40%', animationDelay: '1.2s', animationDuration: '6s' }}></div>
        <div className="shooting-star" style={{ top: '25%', left: '85%', animationDelay: '2.5s', animationDuration: '4.5s' }}></div>
        <div className="shooting-star" style={{ top: '40%', left: '20%', animationDelay: '4s', animationDuration: '7s' }}></div>
        <div className="shooting-star" style={{ top: '10%', left: '90%', animationDelay: '5.5s', animationDuration: '5.5s' }}></div>
      </div>

      {/* Twinkling Stars (Visible only in dark mode) */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="star" style={{ top: '8%', left: '12%', animationDelay: '0s' }}></div>
        <div className="star big" style={{ top: '15%', left: '25%', animationDelay: '0.5s' }}></div>
        <div className="star" style={{ top: '22%', left: '55%', animationDelay: '1s' }}></div>
        <div className="star" style={{ top: '5%', left: '78%', animationDelay: '1.5s' }}></div>
        <div className="star big" style={{ top: '35%', left: '88%', animationDelay: '2s' }}></div>
        <div className="star" style={{ top: '45%', left: '15%', animationDelay: '0.3s' }}></div>
        <div className="star" style={{ top: '12%', left: '65%', animationDelay: '2.5s' }}></div>
        <div className="star big" style={{ top: '30%', left: '42%', animationDelay: '1.8s' }}></div>
        <div className="star" style={{ top: '50%', left: '72%', animationDelay: '0.7s' }}></div>
        <div className="star" style={{ top: '18%', left: '92%', animationDelay: '3s' }}></div>
        <div className="star big" style={{ top: '40%', left: '5%', animationDelay: '1.2s' }}></div>
        <div className="star" style={{ top: '55%', left: '35%', animationDelay: '2.2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center mt-12">
        <div className="flex items-center justify-center gap-4 text-[0.9375rem] mb-8">
          <span className="text-black dark:text-white">16 July 2026</span>
          <span className="text-[#666666] dark:text-slate-400">Product</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-normal text-black dark:text-white tracking-tight mb-8 leading-[1.05]">
          Introducing AI Prompt Generator
        </h1>
        

        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/signup" className="group flex items-center justify-center gap-2 px-6 py-3.5 text-base text-white bg-black hover:bg-[#333333] dark:bg-gradient-to-r dark:from-[#FFF078] dark:to-[#FFC107] dark:text-[#0A0F24] dark:shadow-[0_0_20px_rgba(255,240,120,0.4)] dark:hover:shadow-[0_0_30px_rgba(255,240,120,0.6)] rounded-full transition-all duration-300">
            Try AI Prompt Generator
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
          <Link href="#demo" className="group flex items-center justify-center gap-1.5 px-2 py-3.5 text-base text-[#111111] dark:text-slate-300 hover:text-[#666666] dark:hover:text-white transition-all duration-300">
            View Live Demo
            <ChevronRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
