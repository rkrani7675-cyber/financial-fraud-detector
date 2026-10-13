export interface FinancialData {
  id?: number;
  company_id?: number;
  year: number;
  revenue: number;
  cogs: number;
  operating_expenses?: number;
  net_profit: number;
  receivables: number;
  inventory: number;
  total_assets: number;
  total_debt: number;
  equity: number;
  operating_cash_flow: number;
  capex: number;
  depreciation: number;
  related_party_transactions?: number;
  interest_expense?: number;
  current_assets?: number;
  current_liabilities?: number;
}

export interface Ratio {
  id?: number;
  company_id?: number;
  year: number;
  gross_margin?: number | null;
  operating_margin?: number | null;
  net_margin?: number | null;
  roe?: number | null;
  roa?: number | null;
  roce?: number | null;
  current_ratio?: number | null;
  quick_ratio?: number | null;
  ocf_ratio?: number | null;
  debt_to_equity?: number | null;
  debt_to_assets?: number | null;
  interest_coverage?: number | null;
  receivables_turnover?: number | null;
  inventory_turnover?: number | null;
  asset_turnover?: number | null;
  cash_conversion_cycle?: number | null;
  ocf_to_profit?: number | null;
  free_cash_flow?: number | null;
}

export interface Anomaly {
  id: number;
  company_id: number;
  anomaly_type: "A" | "B" | "C" | "D" | "E" | "F" | "G" | string;
  name: string;
  year: number;
  description: string;
  risk_points: number;
  created_at: string;
}

export interface Explanation {
  id: number;
  company_id: number;
  anomaly_id: number;
  detected: string;
  why_it_matters: string;
  recommended_investigation: string;
  created_at: string;
}

export interface CompanyListItem {
  id: number;
  name: string;
  risk_score: number;
  risk_level: "Low" | "Moderate" | "High" | string;
  years_count: number;
  created_at: string;
}

export interface AnalysisResult {
  company_id: number;
  company_name: string;
  risk_score: number;
  risk_level: "Low" | "Moderate" | "High" | string;
  anomalies: Anomaly[];
  explanations: Explanation[];
  ratios: Ratio[];
  financial_data: FinancialData[];
}

export interface UploadResponse {
  success: boolean;
  company_id: number;
  company_name: string;
  message: string;
  years_found: number;
  data_points: number;
}
