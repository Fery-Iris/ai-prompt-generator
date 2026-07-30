"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { registerUser } from "@/lib/actions/auth";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/login?registered=true");
    }
  }, [state?.success, router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <Image src="/Logo.png" alt="PromptGen Logo" width={40} height={40} className="w-10 h-10 rounded-xl object-contain shadow-md transition-transform duration-300 group-hover:scale-110" />
        </Link>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:text-blue-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-white/[0.03] dark:backdrop-blur-sm py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-white/[0.08]">
          <form action={formAction} className="space-y-6">
            
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in-up">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-white/[0.05] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                  placeholder="promptmaster99"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-white/[0.05] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-white/[0.05] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white dark:text-white bg-[var(--color-primary)] hover:bg-blue-700 dark:hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-[#2563EB]/20 hover:-translate-y-0.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-[#0D1230] text-slate-500 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-white/[0.05] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
