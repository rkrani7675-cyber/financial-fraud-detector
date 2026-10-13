"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, UserResponse } from "../../lib/auth";
import ApiKeyInput from "../../components/ApiKeyInput";
import { Settings, Shield, Cpu, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { SpotlightCard, ShinyBadge } from "../../components/react-bits";

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Back button & Page Title */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Account & AI Engine Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Configure multi-model AI inference (Groq, OpenAI, OpenRouter, DeepSeek, Ollama) for{" "}
              <span className="text-indigo-400 font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>
      </div>

      {/* Floating Key Component */}
      <ApiKeyInput />

      {/* Information Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <SpotlightCard className="p-5 border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Open Provider Architecture</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect any OpenAI-compatible API: high-speed Groq LPUs, OpenRouter, DeepSeek, or private local Ollama running offline.
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-5 border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Ephemeral Session Storage</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Keys and custom endpoints are held strictly in your browser&apos;s tab memory (<code className="text-slate-300">sessionStorage</code>). They are never saved to the server database.
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-5 border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Zero Server Persistence</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Explanations generated with your key are synthesized on the fly and never cached. Closing your tab purges all credentials immediately.
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}
