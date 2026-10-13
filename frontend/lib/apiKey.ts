const API_KEY_SESSION_STORAGE_KEY = "user_openai_api_key";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Retrieve floating OpenAI API key from browser sessionStorage.
 * Strictly ephemeral browser session memory.
 */
export function getStoredApiKey(): string | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  const key = window.sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
  return key && key.trim() ? key.trim() : null;
}

/**
 * Store floating OpenAI API key strictly into browser sessionStorage.
 * Cleared automatically upon closing the tab or browser session.
 */
export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  const cleanKey = key.trim();
  if (cleanKey) {
    window.sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, cleanKey);
  } else {
    clearStoredApiKey();
  }
}

/**
 * Clear floating OpenAI API key from browser sessionStorage.
 */
export function clearStoredApiKey(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  window.sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
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
 * Safely test an OpenAI API key via backend test endpoint.
 * Sends key strictly in the X-User-OpenAI-Key header (never in body, never in URL).
 */
export async function testStoredApiKey(key?: string): Promise<{ success: boolean; message: string }> {
  const targetKey = (key || getStoredApiKey() || "").trim();
  if (!targetKey) {
    return { success: false, message: "Please provide an API key to test." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/test-key`, {
      method: "POST",
      headers: {
        "X-User-OpenAI-Key": targetKey,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, message: data.message || "OpenAI API key verified successfully." };
    }
    return {
      success: false,
      message: data.message || data.detail || "Validation failed: Key is invalid or expired.",
    };
  } catch {
    return {
      success: false,
      message: "Network error connecting to backend validation service.",
    };
  }
}
