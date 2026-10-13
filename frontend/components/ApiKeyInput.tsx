"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  Trash2,
  Check,
  Zap,
} from "lucide-react";
import {
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
  testStoredApiKey,
  hasStoredApiKey,
} from "../lib/apiKey";

export default function ApiKeyInput() {
  const [keyInput, setKeyInput] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const configured = hasStoredApiKey();
    setIsConfigured(configured);
    if (configured) {
      const stored = getStoredApiKey();
      if (stored) {
        setKeyInput(stored);
      }
    }
  }, []);

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setNotification({
        type: "error",
        message: "API key cannot be empty. Please paste your OpenAI API key.",
      });
      return;
    }

    if (!trimmed.startsWith("sk-")) {
      setNotification({
        type: "error",
        message: "Invalid format: OpenAI API keys typically start with 'sk-'.",
      });
      return;
    }

    setStoredApiKey(trimmed);
    setIsConfigured(true);
    setNotification({
      type: "success",
      message: "Key saved to sessionStorage for this tab.",
    });
  };

  const handleTest = async () => {
    const targetKey = keyInput.trim() || getStoredApiKey() || "";
    if (!targetKey) {
      setNotification({
        type: "error",
        message: "Enter an API key first before testing.",
      });
      return;
    }

    setTesting(true);
    setNotification(null);

    const result = await testStoredApiKey(targetKey);
    setTesting(false);

    if (result.success) {
      setNotification({
        type: "success",
        message: result.message,
      });
    } else {
      setNotification({
        type: "error",
        message: result.message,
      });
    }
  };

  const handleClear = () => {
    clearStoredApiKey();
    setKeyInput("");
    setIsConfigured(false);
    setShowKey(false);
    setNotification({
      type: "info",
      message: "API key cleared from this session.",
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              OpenAI API Key (Floating Key)
            </h3>
            <p className="text-xs text-slate-400">
              Provide your personal OpenAI key for dedicated explanation generation
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isConfigured ? (
            <span
              id="api-key-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔑 Configured ✓</span>
            </span>
          ) : (
            <span
              id="api-key-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>🔑 Not configured</span>
            </span>
          )}
        </div>
      </div>

      {/* Security Warning UI */}
      <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold">Security Isolation:</strong>{" "}
          Your key is stored only in this browser tab. Never share it. It will be automatically deleted when this tab or browser session is closed. It is never stored in any database.
        </div>
      </div>

      {/* Input Field */}
      <div className="mt-6">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          OpenAI API Key Secret
        </label>
        <div className="relative">
          <input
            id="openai-api-key-input"
            type={showKey ? "text" : "password"}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-proj-••••••••••••••••••••••••"
            className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono tracking-wider placeholder:text-slate-600 transition-colors pr-12"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title={showKey ? "Mask API Key" : "Reveal API Key"}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500 font-mono">
          Only sent via <code className="text-rose-400">X-User-OpenAI-Key</code> header during analysis requests.
        </p>
      </div>

      {/* Notifications / Alerts */}
      {notification && (
        <div
          className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
              : notification.type === "error"
              ? "bg-rose-950/50 border-rose-800 text-rose-300"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : notification.type === "error" ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Action Buttons: Save, Test, Clear */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          id="save-api-key-btn"
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-600/20 hover:opacity-95 transition-opacity"
        >
          <Check className="w-4 h-4" />
          <span>Save Key</span>
        </button>

        <button
          id="test-api-key-btn"
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
          ) : (
            <Zap className="w-4 h-4 text-amber-400" />
          )}
          <span>{testing ? "Testing..." : "Test Key"}</span>
        </button>

        <button
          id="clear-api-key-btn"
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
