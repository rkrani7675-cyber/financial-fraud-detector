import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Fraud Detector | AI Statement Anomaly Detection",
  description: "Forensic AI-assisted financial statement anomaly detection and reporting risk evaluation system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        <Suspense fallback={<div className="h-16 bg-slate-900 border-b border-slate-800" />}>
          <Header />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>© 2026 Financial Fraud Detector — AI Statement Anomaly Detection Engine (PRD v1.0 MVP)</p>
          <p className="mt-1 text-[11px] text-slate-600">
            For academic and analytical audit screening only. Identifies reporting patterns; does not assert legal determinations.
          </p>
        </footer>
      </body>
    </html>
  );
}
