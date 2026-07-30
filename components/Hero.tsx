import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-20 sm:pt-24 sm:pb-24 overflow-hidden hero-wave-section text-center min-h-[80vh] flex items-center" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="hero-wave">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center mt-12">
        <div className="flex items-center justify-center gap-4 text-[15px] mb-8">
          <span className="text-black">16 July 2026</span>
          <span className="text-[#666666]">Product</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-[88px] font-normal text-black tracking-tight mb-8 leading-[1.05]">
          Introducing AI Prompt Generator
        </h1>
        

        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/signup" className="group flex items-center justify-center gap-2 px-6 py-3.5 text-base text-white bg-black hover:bg-[#333333] rounded-full transition-all duration-300">
            Try AI Prompt Generator
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
          <Link href="#demo" className="group flex items-center justify-center gap-1.5 px-2 py-3.5 text-base text-[#111111] hover:text-[#666666] transition-all duration-300">
            View Live Demo
            <ChevronRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
