"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logoutUser, UserResponse } from "../../lib/auth";
import ApiKeyInput from "../../components/ApiKeyInput";
import {
  Settings,
  User as UserIcon,
  Shield,
  Cpu,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Building,
  Mail,
  Briefcase,
  FileText,
  Save,
  LogOut,
  Sliders,
} from "lucide-react";
import { SpotlightCard, ShinyBadge, AnimatedTabs } from "../../components/react-bits";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Profile Form State
  const [fullName, setFullName] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("Senior Financial Auditor");
  const [organization, setOrganization] = useState<string>("Forensic Risk Engineering");
  const [auditFocus, setAuditFocus] = useState<string>(
    "Multi-year financial statements divergence, working capital abnormalities, and earnings quality screening."
  );
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  // Preferences State
  const [currency, setCurrency] = useState<string>("USD ($)");
  const [dateFormat, setDateFormat] = useState<string>("YYYY-MM-DD");

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((userData) => {
      if (!mounted) return;
      if (!userData) {
        router.push("/login?redirect=/settings");
      } else {
        setUser(userData);
        setFullName(userData.name);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const settingsTabs = [
    { id: "profile", label: "Profile Details", icon: <UserIcon className="w-3.5 h-3.5" /> },
    { id: "ai", label: "AI Engine", icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: "preferences", label: "Preferences", icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: "security", label: "Security & Session", icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back button & Page Title */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Companies</span>
        </Link>
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Application Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage your profile details, AI inference provider, and application preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-800/80 pb-3">
        <AnimatedTabs
          tabs={settingsTabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <SpotlightCard className="p-6 sm:p-8 border-slate-800/90 space-y-6">
            {/* Header info with Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md font-mono shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">{user?.name || "Auditor"}</h2>
                  <ShinyBadge variant="emerald" size="sm">
                    Verified Account
                  </ShinyBadge>
                </div>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                <p className="text-[11px] text-slate-500">Auditor ID: #{user?.id || 1}</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-sm text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>

                {/* Job Title / Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-rose-400" />
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Financial Auditor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    Organization / Firm
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Apex Global Audit Partners"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Bio / Audit Focus */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Audit Focus & Bio
                </label>
                <textarea
                  rows={3}
                  value={auditFocus}
                  onChange={(e) => setAuditFocus(e.target.value)}
                  placeholder="Describe your research or forensic investigation focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed"
                />
              </div>

              {/* Success Alert */}
              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Profile details updated successfully.</span>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Profile Details
                </button>
              </div>
            </form>
          </SpotlightCard>
        </div>
      )}

      {/* TAB 2: AI Engine */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <ApiKeyInput />

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
                <span>Session Memory Isolation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keys and custom endpoints are held strictly in browser memory. They are never saved to the server database.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>Zero Storage Persistence</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explanations generated with your key are synthesized on the fly and never cached. Closing your tab purges all credentials immediately.
              </p>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* TAB 3: Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <SpotlightCard className="p-6 sm:p-8 border-slate-800/90 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Display & Regional Formats</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize how financial values and dates are displayed across all corporate analysis reports
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Default Audit Timeline Depth</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Preferred historical chronological range for multi-year trend analysis
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 text-xs font-mono font-bold border border-indigo-800/60">
                10 Fiscal Years
              </span>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* TAB 4: Security & Session */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <SpotlightCard className="p-6 sm:p-8 border-slate-800/90 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Session & Authentication Security</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active session credentials and authentication safeguards
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Authentication Protocol</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    JSON Web Token (JWT) secured with httpOnly, SameSite=Lax cookie
                  </div>
                </div>
                <ShinyBadge variant="emerald" size="sm">
                  Active Secure
                </ShinyBadge>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Password Hash Standard</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Salted 12-round bcrypt hash verification (zero plaintext exposure)
                  </div>
                </div>
                <ShinyBadge variant="indigo" size="sm">
                  bcrypt 12
                </ShinyBadge>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Sign Out of Session</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Clears all session cookies and returns to the sign-in screen
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}
