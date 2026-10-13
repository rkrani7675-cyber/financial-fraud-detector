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
  Globe,
  Cpu,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  AI_PROVIDERS,
  AIProviderPreset,
  getStoredAIConfig,
  setStoredAIConfig,
  clearStoredApiKey,
  testStoredApiKey,
  hasStoredApiKey,
  maskApiKey,
} from "../lib/apiKey";
import { SpotlightCard, ShinyBadge, AnimatedTabs } from "./react-bits";

export default function ApiKeyInput() {
  const [selectedProviderId, setSelectedProviderId] = useState<string>("openai");
  const [keyInput, setKeyInput] = useState<string>("");
  const [baseUrlInput, setBaseUrlInput] = useState<string>("");
  const [modelInput, setModelInput] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const configured = hasStoredApiKey();
    setIsConfigured(configured);
    const stored = getStoredAIConfig();
    setSelectedProviderId(stored.providerId || "openai");
    setKeyInput(stored.apiKey || "");
    setBaseUrlInput(stored.baseUrl || "");
    setModelInput(stored.model || "");
  }, []);

  const activePreset: AIProviderPreset =
    AI_PROVIDERS.find((p) => p.id === selectedProviderId) || AI_PROVIDERS[0];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    const preset = AI_PROVIDERS.find((p) => p.id === providerId);
    if (preset) {
      setBaseUrlInput(preset.defaultBaseUrl);
      setModelInput(preset.defaultModel);
      setNotification(null);
    }
  };

  const handleSave = () => {
    const trimmedKey = keyInput.trim();
    const isLocalOllama = selectedProviderId === "ollama";

    if (!trimmedKey && !isLocalOllama) {
      setNotification({
        type: "error",
        message: "API key cannot be empty. Please enter your provider API key.",
      });
      return;
    }

    setStoredAIConfig({
      apiKey: trimmedKey || (isLocalOllama ? "ollama" : ""),
      providerId: selectedProviderId,
      baseUrl: baseUrlInput.trim() || activePreset.defaultBaseUrl,
      model: modelInput.trim() || activePreset.defaultModel,
    });

    setIsConfigured(true);
    setNotification({
      type: "success",
      message: `${activePreset.name} settings saved to sessionStorage for this tab.`,
    });
  };

  const handleTest = async () => {
    const targetKey = keyInput.trim();
    const targetBaseUrl = baseUrlInput.trim() || activePreset.defaultBaseUrl;
    const targetModel = modelInput.trim() || activePreset.defaultModel;

    setTesting(true);
    setNotification(null);

    const result = await testStoredApiKey(targetKey, targetBaseUrl, targetModel);
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
      message: "AI configuration cleared from this browser session.",
    });
  };

  const providerTabs = AI_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.name,
  }));

  return (
    <div className="space-y-6">
      {/* Provider Selector Tabs */}
      <SpotlightCard className="p-5 sm:p-6 border-slate-800/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Select AI Inference Provider
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect to OpenAI, high-speed Groq LPUs, OpenRouter, DeepSeek, or run locally via Ollama
            </p>
          </div>
          <ShinyBadge variant="indigo" size="sm" icon={<Sparkles className="w-3 h-3" />}>
            Open Architecture
          </ShinyBadge>
        </div>

        {/* Provider Tabs */}
        <div className="mt-4 overflow-x-auto pb-1">
          <AnimatedTabs
            tabs={providerTabs}
            activeTab={selectedProviderId}
            onChange={handleProviderSelect}
            size="md"
          />
        </div>

        {/* Selected Provider Overview Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{activePreset.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-semibold text-slate-300">
                {activePreset.badge}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{activePreset.description}</p>
          </div>
          {activePreset.helpUrl && (
            <a
              href={activePreset.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-indigo-300 hover:text-white font-medium transition-colors shrink-0"
            >
              <span>Get {activePreset.name} API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </SpotlightCard>

      {/* Configuration Form Card */}
      <SpotlightCard className="p-6 sm:p-7 border-slate-800/90">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              {activePreset.name} Credentials & Endpoint
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stored strictly in ephemeral browser sessionStorage • Cleared on tab close
            </p>
          </div>

          <div>
            {isConfigured ? (
              <ShinyBadge variant="emerald" size="sm" icon={<Check className="w-3 h-3" />}>
                Configured ✓
              </ShinyBadge>
            ) : (
              <ShinyBadge variant="slate" size="sm">
                Not Configured
              </ShinyBadge>
            )}
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {activePreset.name} API Key / Token
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={activePreset.placeholderKey}
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isConfigured && keyInput && (
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Active session mask: {maskApiKey(keyInput)}
              </p>
            )}
          </div>

          {/* Base URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                API Base URL
              </label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder={activePreset.defaultBaseUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Model Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Model Name
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder={activePreset.defaultModel}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Notification banner */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                notification.type === "success"
                  ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
                  : notification.type === "error"
                  ? "bg-rose-950/50 border-rose-800/80 text-rose-300"
                  : "bg-slate-950 border-slate-800 text-slate-300"
              }`}
            >
              {notification.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {notification.type === "error" && <XCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              {notification.type === "info" && <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400" />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Connecting to {activePreset.name}...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/80 text-slate-400 hover:text-rose-300 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                title="Clear floating key from this tab"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Isolation Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Zero-Persistence Policy:</strong> User keys and endpoints are stored strictly in your browser session memory. Explanations generated with your key are dynamically synthesized and never cached in the server database. Closing the browser tab purges all credentials immediately.
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
}
