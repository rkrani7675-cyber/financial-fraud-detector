import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../components/Header";
import BackgroundPattern from "../components/react-bits/BackgroundPattern";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Fraud Detector | Forensic Statement Anomaly Platform",
  description:
    "Production-ready forensic accounting anomaly detection platform. Analyzes 10-year financial statements across 18 ratios, 7 forensic rules, and multi-model AI diagnostics.",
  authors: [{ name: "Financial Risk Engineering Portfolio" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#06090f] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans">
        <BackgroundPattern />
        <Suspense fallback={<div className="h-16 bg-slate-900/60 border-b border-slate-800" />}>
          <Header />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <footer className="border-t border-slate-900/80 bg-slate-950/60 backdrop-blur-md py-6 text-center text-xs text-slate-400 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-400">
              © 2026 <span className="text-slate-200 font-semibold">Financial Fraud Detector</span> — Forensic Accounting Risk Intelligence Platform
            </p>
            <p className="text-[11px] text-slate-400">
              For research and forensic screening • Multi-Model AI Diagnostics (OpenAI • Groq • OpenRouter • DeepSeek • Ollama)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
