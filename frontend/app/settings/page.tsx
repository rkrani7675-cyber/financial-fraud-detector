"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, UserResponse } from "../../lib/auth";
import ApiKeyInput from "../../components/ApiKeyInput";
import { Settings, Shield, Cpu, Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((userData) => {
      if (!mounted) return;
      if (!userData) {
        router.push("/login?redirect=/settings");
      } else {
        setUser(userData);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button & Page Title */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-rose-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-rose-600/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Account & Engine Settings
            </h1>
            <p className="text-sm text-slate-400">
              Manage your personal OpenAI API keys and session preferences for auditor{" "}
              <span className="text-rose-400 font-medium">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>
      </div>

      {/* Floating Key Component */}
      <ApiKeyInput />

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Dedicated Quota</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By configuring your own OpenAI key, forensic anomaly explanations use your own API tier and rate limits.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Ephemeral Privacy</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Keys are strictly held in your browser&apos;s tab memory (<code className="text-slate-300">sessionStorage</code>). They are never saved to the SQLite database.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Zero Persistence</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you close this tab, your key is immediately and irreversibly purged from memory.
          </p>
        </div>
      </div>
    </div>
  );
}
