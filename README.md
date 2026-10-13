# Financial Fraud Detector

An AI-assisted forensic analysis platform that audits multi-year financial statements to detect accounting anomalies and assess reporting risk.

---

## Features

- **Automated Statement Ingestion:** Ingests 10-year Excel (`.xlsx`) and `.csv` statements with schema validation and type coercion.
- **Financial Ratio Engine:** Computes 18 foundational ratios covering profitability, liquidity, working capital, and leverage.
- **7 Forensic Anomaly Rules:** Detects divergences across receivables vs. revenue, cash vs. profit, inventory buildups, margin jumps, related-party spikes, capex vs. depreciation, and debt anomalies (Rules A–G).
- **Composite Risk Scoring:** Evaluates historical anomalies into a unified 0–100 risk score (Low, Moderate, High).
- **AI Diagnostics & Floating Keys:** Delivers structured 3-part diagnostic reports via OpenAI or audited heuristic fallbacks, supporting tab-isolated floating API keys (`sessionStorage`).
- **Hardened Authentication:** Cookie-based session security via `httpOnly`, `SameSite=Lax` JWT tokens with full route protection.

---

## Tech Stack

**FastAPI**, **SQLAlchemy (SQLite)**, **Pydantic**, **Next.js 16 (App Router)**, **Tailwind CSS**, **Recharts**, and **OpenAI API**.

---

## Setup

```bash
# 1. Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000

# 2. Frontend Setup (in a separate terminal)
cd frontend
npm install
npm run build && npm run start -- -p 3000   # or npm run dev
```

---

## Usage

1. **Sign In:** Create an account or sign in at [http://localhost:3000/login](http://localhost:3000/login).
2. **Upload Statements:** Go to `/upload` and submit a 10-year statement (template provided at `/sample_financial_data.xlsx`).
3. **Inspect Dashboard:** View the risk gauge, interactive trend charts, and expand flagged anomaly cards to review AI investigation recommendations.

---

## Limitation

> **Disclaimer:** This system identifies mathematical, structural, and reporting anomalies within provided financial data. It does not make legal determinations or assert factual fraud. Output is intended exclusively for academic research and audit screening.

---

## License

MIT License
