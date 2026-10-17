"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFinancialFile, loadDemoDataset, aiExtractCompanyStatements } from "../lib/api";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Sparkles,
  Building2,
  Trash2,
} from "lucide-react";
import { SpotlightCard, ShinyBadge } from "./react-bits";

export default function FileUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [isAIExtracting, setIsAIExtracting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMsg("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!companyName) {
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[_-]/g, " ");
      setCompanyName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrorMsg(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select an Excel or CSV file to upload, or use 'Extract with AI' below.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await uploadFinancialFile(selectedFile, companyName);
      setSuccessMsg(result.message);
      setTimeout(() => {
        router.push(`/dashboard/${result.company_id}`);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload and analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIExtract = async () => {
    if (!companyName.trim()) {
      setErrorMsg("Please enter a company name (e.g. Tesla, Apple, Tata Motors) to extract statements with AI.");
      return;
    }

    setIsAIExtracting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await aiExtractCompanyStatements(companyName.trim(), 5);
      setSuccessMsg(`Multi-year financial statements successfully generated with AI for ${companyName}!`);
      setTimeout(() => {
        router.push(`/dashboard/${result.company_id}`);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate statements with AI. You can upload an Excel file instead.");
    } finally {
      setIsAIExtracting(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await loadDemoDataset();
      setSuccessMsg("Pre-packaged 10-year statement loaded successfully!");
      setTimeout(() => {
        router.push(`/dashboard/${result.company_id}`);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load demo dataset. You can upload manually below.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 1-Click Demo Evaluation Banner for Vercel Portfolio Reviewers */}
      <SpotlightCard
        spotlightColor="rgba(99, 102, 241, 0.15)"
        className="p-5 sm:p-6 border-indigo-900/60 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShinyBadge variant="indigo" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                Instant Portfolio Demo
              </ShinyBadge>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Test Without an Excel File
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-md">
              Loads our audited 10-year test statement (Apex Global Holdings Ltd., 18 ratios, 7 flagged forensic anomaly rules).
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isDemoLoading || isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingesting Statement...</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Load 10-Yr Demo Dataset</span>
              </>
            )}
          </button>
        </div>
      </SpotlightCard>

      {/* Main Upload Form Card */}
      <SpotlightCard className="p-6 sm:p-8 border-slate-800/90">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Upload Financial Statements
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload multi-year financial statements (.xlsx or .csv) for forensic anomaly analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name Optional Input + AI Statement Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Company Name (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Don&apos;t have an Excel file?</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Global Holdings Ltd., Tesla, Apple..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={handleAIExtract}
                disabled={!companyName.trim() || isAIExtracting || isLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-700/60 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                title="Automatically generate or extract multi-year financial statements for this company using AI"
              >
                {isAIExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Extracting with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Extract with AI</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Type any company name and click <span className="text-indigo-400 font-medium">Extract with AI</span> to run analysis without preparing spreadsheets.
            </p>
          </div>

          {/* Drag-and-Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-950/20"
                : selectedFile
                ? "border-emerald-500/80 bg-emerald-950/10"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-3">
              <div
                className={`p-3.5 rounded-2xl ${
                  selectedFile
                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/60"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {selectedFile ? (
                  <FileSpreadsheet className="w-8 h-8" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-white font-mono">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold transition-all mt-2 cursor-pointer shadow-sm"
                    title="Remove selected file"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove file</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drop your Excel or CSV file here, or{" "}
                    <span className="text-indigo-400 underline underline-offset-2">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Supports .xlsx, .xls, .csv (Max 10MB • Min 3 chronological years)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg} Redirecting to report...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isDemoLoading || isAIExtracting || !selectedFile}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLoading || isAIExtracting || !selectedFile
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-lg shadow-indigo-600/30 hover:opacity-95"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Financial Statements...</span>
              </>
            ) : (
              <span>Analyze Financial Statements</span>
            )}
          </button>

          {/* Sample Template Downloads */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>Download reference statement templates:</span>
            <div className="flex items-center gap-3">
              <a
                href="/sample_financial_data.xlsx"
                download
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Sample .xlsx
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="/sample_financial_data.csv"
                download
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Sample .csv
              </a>
            </div>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
}
