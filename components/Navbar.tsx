import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-sm">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-[var(--color-foreground)]">PromptGen</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)] transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)] transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)] transition-colors">FAQ</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-[var(--color-foreground)] transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
