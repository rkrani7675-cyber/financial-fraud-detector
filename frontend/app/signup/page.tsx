"use client";

import SignupForm from "../../components/SignupForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-6 sm:py-12">
      <div className="mb-6 max-w-md mx-auto w-full flex items-center justify-between text-xs">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Have an account? Sign In
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Step 1: Create Auditor Account</span>
      </div>

      <SignupForm />
    </div>
  );
}
