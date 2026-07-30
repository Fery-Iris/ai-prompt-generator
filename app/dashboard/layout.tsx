import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Sparkles, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0D1230] border-r border-slate-200 dark:border-white/[0.06] flex flex-col transition-colors duration-300">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white dark:text-[#0A0F24] shadow-sm">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg text-[var(--color-foreground)]">PromptGen</span>
          </Link>
          <AnimatedThemeToggler className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-[var(--color-primary)] transition-colors"
          >
            <LayoutDashboard size={18} />
            My Prompts
          </Link>
          <Link 
            href="/dashboard/new" 
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-white dark:text-[#0A0F24] bg-[var(--color-primary)] hover:bg-blue-700 dark:hover:opacity-90 transition-colors shadow-sm shadow-blue-500/20 dark:shadow-[#FFF078]/10"
          >
            <PlusCircle size={18} />
            New Prompt
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/[0.1] flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">
              {session.user.name?.[0] || session.user.email?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session.user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <form 
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button 
              type="submit" 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
