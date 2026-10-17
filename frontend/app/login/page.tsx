"use client";

import { Suspense } from "react";
import LoginForm from "../../components/LoginForm";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-6 sm:py-12">
      <div className="mb-6 max-w-md mx-auto w-full flex items-center justify-between text-xs">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Need an account? Sign Up
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Auditor Sign In</span>
      </div>

      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            Loading portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
