export interface AIProviderPreset {
  id: string;
  name: string;
  badge: string;
  defaultBaseUrl: string;
  defaultModel: string;
  placeholderKey: string;
  description: string;
  helpUrl: string;
}

export const AI_PROVIDERS: AIProviderPreset[] = [
  {
    id: "openai",
    name: "OpenAI",
    badge: "Official",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    placeholderKey: "sk-proj-...",
    description: "Standard model suite with structured forensic reasoning.",
    helpUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "groq",
    name: "Groq",
    badge: "Ultra Fast",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    placeholderKey: "gsk_...",
    description: "LPU inference engine with generous developer tier limits.",
    helpUrl: "https://console.groq.com/keys",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Universal",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.3-70b-instruct",
    placeholderKey: "sk-or-v1-...",
    description: "Access any open or proprietary model through one unified API.",
    helpUrl: "https://openrouter.ai/keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Cost Efficient",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    placeholderKey: "sk-...",
    description: "DeepSeek models delivering high analytical throughput.",
    helpUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "ollama",
    name: "Local Ollama",
    badge: "100% Private",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3",
    placeholderKey: "ollama",
    description: "Run models locally on your workstation with zero external telemetry.",
    helpUrl: "https://ollama.com",
  },
  {
    id: "custom",
    name: "Custom Gateway",
    badge: "Custom Endpoint",
    defaultBaseUrl: "https://your-llm-gateway.com/v1",
    defaultModel: "custom-model",
    placeholderKey: "Enter authorization key...",
    description: "Connect any OpenAI-compatible endpoint (LiteLLM, LM Studio, vLLM).",
    helpUrl: "",
  },
];

export interface StoredAIConfig {
  apiKey: string;
  providerId: string;
  baseUrl: string;
  model: string;
}

const STORAGE_KEY_API_KEY = "user_ai_api_key";
const STORAGE_KEY_PROVIDER = "user_ai_provider_id";
const STORAGE_KEY_BASE_URL = "user_ai_base_url";
const STORAGE_KEY_MODEL = "user_ai_model";

// Legacy key for backwards compatibility
const LEGACY_STORAGE_KEY_API_KEY = "user_openai_api_key";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Retrieve active floating AI configuration strictly from ephemeral sessionStorage.
 */
export function getStoredAIConfig(): StoredAIConfig {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return { apiKey: "", providerId: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
  }

  const legacyKey = window.sessionStorage.getItem(LEGACY_STORAGE_KEY_API_KEY);
  const apiKey = (window.sessionStorage.getItem(STORAGE_KEY_API_KEY) || legacyKey || "").trim();
  const providerId = (window.sessionStorage.getItem(STORAGE_KEY_PROVIDER) || "openai").trim();
  const defaultPreset = AI_PROVIDERS.find((p) => p.id === providerId) || AI_PROVIDERS[0];
  const baseUrl = (window.sessionStorage.getItem(STORAGE_KEY_BASE_URL) || defaultPreset.defaultBaseUrl).trim();
  const model = (window.sessionStorage.getItem(STORAGE_KEY_MODEL) || defaultPreset.defaultModel).trim();

  return { apiKey, providerId, baseUrl, model };
}

/**
 * Retrieve floating API key from browser sessionStorage.
 */
export function getStoredApiKey(): string | null {
  const config = getStoredAIConfig();
  return config.apiKey ? config.apiKey : null;
}

/**
 * Store floating AI config strictly into browser sessionStorage.
 */
export function setStoredAIConfig(config: Partial<StoredAIConfig>): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  if (config.apiKey !== undefined) {
    const key = config.apiKey.trim();
    if (key) {
      window.sessionStorage.setItem(STORAGE_KEY_API_KEY, key);
      window.sessionStorage.setItem(LEGACY_STORAGE_KEY_API_KEY, key);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY_API_KEY);
      window.sessionStorage.removeItem(LEGACY_STORAGE_KEY_API_KEY);
    }
  }

  if (config.providerId !== undefined) {
    window.sessionStorage.setItem(STORAGE_KEY_PROVIDER, config.providerId.trim());
  }

  if (config.baseUrl !== undefined) {
    window.sessionStorage.setItem(STORAGE_KEY_BASE_URL, config.baseUrl.trim());
  }

  if (config.model !== undefined) {
    window.sessionStorage.setItem(STORAGE_KEY_MODEL, config.model.trim());
  }
}

/**
 * Convenience helper to set key directly.
 */
export function setStoredApiKey(key: string): void {
  setStoredAIConfig({ apiKey: key });
}

/**
 * Clear floating AI config from browser sessionStorage.
 */
export function clearStoredApiKey(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEY_API_KEY);
  window.sessionStorage.removeItem(LEGACY_STORAGE_KEY_API_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY_PROVIDER);
  window.sessionStorage.removeItem(STORAGE_KEY_BASE_URL);
  window.sessionStorage.removeItem(STORAGE_KEY_MODEL);
}

/**
 * Check whether a floating API key is currently configured in sessionStorage.
 */
export function hasStoredApiKey(): boolean {
  return !!getStoredApiKey();
}

/**
 * Returns a masked representation of the key for safe UI display (e.g., sk-••••••••3aB9).
 */
export function maskApiKey(key: string): string {
  const cleanKey = key.trim();
  if (!cleanKey) return "";
  if (cleanKey.length <= 8) return "••••••••";
  const start = cleanKey.slice(0, 3);
  const end = cleanKey.slice(-4);
  return `${start}••••••••••••${end}`;
}

/**
 * Safely test an AI provider connection via backend test endpoint.
 * Sends configuration strictly in HTTP headers (never in query or body).
 */
export async function testStoredApiKey(
  key?: string,
  baseUrl?: string,
  model?: string
): Promise<{ success: boolean; message: string }> {
  const config = getStoredAIConfig();
  const targetKey = (key !== undefined ? key : config.apiKey).trim();
  const targetBaseUrl = (baseUrl !== undefined ? baseUrl : config.baseUrl).trim();
  const targetModel = (model !== undefined ? model : config.model).trim();

  if (!targetKey && !targetBaseUrl.includes("localhost") && !targetBaseUrl.includes("127.0.0.1")) {
    return { success: false, message: "Please enter an API key or token to verify." };
  }

  try {
    const headers: Record<string, string> = {
      "X-User-AI-Key": targetKey || "ollama",
      "X-User-OpenAI-Key": targetKey || "ollama",
    };
    if (targetBaseUrl) {
      headers["X-User-AI-Base-URL"] = targetBaseUrl;
    }
    if (targetModel) {
      headers["X-User-AI-Model"] = targetModel;
    }

    const res = await fetch(`${API_BASE_URL}/test-key`, {
      method: "POST",
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, message: data.message || "AI endpoint verified successfully." };
    }
    return {
      success: false,
      message: data.message || data.detail || "Validation failed: Provider returned an error.",
    };
  } catch {
    return {
      success: false,
      message: "Network error connecting to backend validation service.",
    };
  }
}

