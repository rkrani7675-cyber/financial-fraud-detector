import { CompanyListItem, AnalysisResult, UploadResponse, Anomaly, Explanation } from "./types";
import { getStoredAIConfig } from "./apiKey";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function buildAIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const config = getStoredAIConfig();
  if (config.apiKey) {
    headers["X-User-AI-Key"] = config.apiKey;
    headers["X-User-OpenAI-Key"] = config.apiKey;
  }
  if (config.baseUrl) {
    headers["X-User-AI-Base-URL"] = config.baseUrl;
  }
  if (config.model) {
    headers["X-User-AI-Model"] = config.model;
  }
  return headers;
}

async function parseErrorResponse(res: Response, defaultMessage: string): Promise<string> {
  try {
    const data = await res.json();
    return data.detail || data.message || `${defaultMessage} (Status ${res.status})`;
  } catch {
    return `${defaultMessage} (Status ${res.status}: ${res.statusText || "Server error"})`;
  }
}

export async function fetchCompanies(): Promise<CompanyListItem[]> {
  const res = await fetch(`${API_BASE_URL}/companies`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, "Failed to fetch companies registry");
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchAnalysis(companyId: number): Promise<AnalysisResult> {
  const headers = buildAIHeaders();

  const res = await fetch(`${API_BASE_URL}/analyze/${companyId}`, {
    cache: "no-store",
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, `Failed to fetch analysis for company ID ${companyId}`);
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchAnomalies(companyId: number): Promise<Anomaly[]> {
  const res = await fetch(`${API_BASE_URL}/anomalies/${companyId}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, `Failed to fetch anomalies for company ID ${companyId}`);
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function fetchExplanations(companyId: number): Promise<Explanation[]> {
  const headers = buildAIHeaders();

  const res = await fetch(`${API_BASE_URL}/explanations/${companyId}`, {
    cache: "no-store",
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, `Failed to fetch AI explanations for company ID ${companyId}`);
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function loadDemoDataset(): Promise<UploadResponse> {
  const res = await fetch(`${API_BASE_URL}/upload/demo`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, "Failed to load pre-packaged demo dataset");
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function uploadFinancialFile(file: File, companyName?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (companyName && companyName.trim()) {
    formData.append("company_name", companyName.trim());
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, "Upload and analysis failed");
    throw new Error(errorMsg);
  }

  return await res.json();
}

export async function deleteCompany(companyId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/company/${companyId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const errorMsg = await parseErrorResponse(res, `Failed to delete company ID ${companyId}`);
    throw new Error(errorMsg);
  }
  return true;
}
