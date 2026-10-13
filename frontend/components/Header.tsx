"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutUser, UserResponse } from "../lib/auth";
import {
  ShieldAlert,
  UploadCloud,
  Building2,
  Download,
  Activity,
  LogOut,
  User as UserIcon,
  LogIn,
  UserPlus,
  Settings as SettingsIcon
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      setUser(userData);
    });
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
    setUser(null);
    setIsLoggingOut(false);
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Overview", href: "/", icon: Activity },
    { label: "Companies", href: "/companies", icon: Building2 },
    { label: "Upload & Analyze", href: "/upload", icon: UploadCloud },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 text-white shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 rounded-xl text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Financial Fraud Detector
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <span>Forensic Statement Audit</span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="hidden md:inline text-indigo-400">Open AI Architecture</span>
            </div>
          </div>
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/90 text-indigo-400 shadow-sm border border-slate-700/80 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Sample template button */}
            <a
              href="/sample_financial_data.xlsx"
              download
              className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/70 hover:bg-emerald-900/70 transition-colors"
              title="Download 10-Year Sample Excel Template"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sample (.xlsx)</span>
            </a>
          </nav>

          {/* User profile / Logout / Auth links */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 max-w-[150px] truncate shadow-inner">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate font-medium">{user.name}</span>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:text-white"
                  title="Configure multi-model AI API keys & endpoints"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all hover:text-white disabled:opacity-50 cursor-pointer"
                  title="Sign out of your session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all hover:text-white"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:opacity-95 transition-opacity"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
