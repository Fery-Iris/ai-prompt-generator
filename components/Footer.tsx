import Link from "next/link";
import { Sparkles, Terminal, MessageCircle, Briefcase } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-[#080B1A] border-t border-slate-200 dark:border-white/[0.06] pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white dark:text-[#0A0F24] shadow-sm">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-lg text-[var(--color-foreground)]">PromptGen</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Empowering creators and developers to build better AI experiences through perfectly crafted prompts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-[var(--color-primary)] transition-colors">
                <span className="sr-only">Social</span>
                <MessageCircle size={20} />
              </a>
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-[var(--color-foreground)] transition-colors">
                <span className="sr-only">Code</span>
                <Terminal size={20} />
              </a>
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-[var(--color-primary)] transition-colors">
                <span className="sr-only">Careers</span>
                <Briefcase size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Guides</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Prompt Library</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">API Reference</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">About</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            &copy; {currentYear} PromptGen Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
