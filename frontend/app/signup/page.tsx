"use client";

import SignupForm from "../../components/SignupForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-6 sm:py-12">
      <div className="mb-6 max-w-md mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </Link>
      </div>

      <SignupForm />
    </div>
  );
}
