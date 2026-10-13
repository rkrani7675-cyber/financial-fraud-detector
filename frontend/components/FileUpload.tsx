"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFinancialFile } from "../lib/api";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle, Loader2, Download } from "lucide-react";

export default function FileUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      setErrorMsg("Please select a financial data file to upload.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await uploadFinancialFile(selectedFile, companyName);
      setSuccessMsg(result.message);
      setTimeout(() => {
        router.push(`/dashboard/${result.company_id}`);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload and analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Upload Financial Statements
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload multi-year financial statements (.xlsx or .csv) for forensic anomaly analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Name Optional Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Company Name (Optional)
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Apex Global Holdings Ltd."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Drag-and-Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-rose-500 bg-rose-950/20"
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
                <UploadCloud className="w-8 h-8 text-rose-400" />
              )}
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-white font-mono">{selectedFile.name}</p>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">
                  Drop your Excel or CSV file here, or{" "}
                  <span className="text-rose-400 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
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
            <span>{successMsg} Redirecting to forensic dashboard...</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isLoading || !selectedFile
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-600/30 hover:opacity-95"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Statement Anomalies...</span>
            </>
          ) : (
            <span>Run Forensic Risk Analysis</span>
          )}
        </button>

        {/* Sample Template Downloads */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Need a compliant dataset?</span>
          <div className="flex items-center gap-3">
            <a
              href="/sample_financial_data.xlsx"
              download
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Sample .xlsx
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="/sample_financial_data.csv"
              download
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Sample .csv
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
