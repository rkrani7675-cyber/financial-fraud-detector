# Financial Fraud Detector (FFD)

> **AI-Assisted Multi-Year Forensic Accounting & Anomaly Detection Platform**  
> An enterprise-grade financial statement auditor designed to uncover hidden accounting anomalies, measure corporate divergence, and provide structured forensic diagnostics using open AI models.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Bits](https://img.shields.io/badge/UI-React%20Bits%20Design-6366f1?style=flat-square)](https://reactbits.dev/)
[![OpenAI Compatible](https://img.shields.io/badge/AI-Open%20Architecture-10a37f?style=flat-square&logo=openai)](https://platform.openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Overview

Traditional financial analysis often struggles to spot non-linear divergences across multi-year balance sheets, income statements, and cash flow reports. **Financial Fraud Detector** combines rigorous deterministic financial ratio algorithms with open-ended LLM forensic intelligence to automatically screen corporate filings for red flags.

Built with a **React Bits** design system (interactive spotlight sheen cards, animated counters, metallic badges, and subtle ambient grids) without tacky neon glows, this platform is optimized for both local development and instant **Vercel / Cloud** deployment.

---

## Key Features

- **Multi-Year Statement Ingestion:** Parses 10-year Excel (`.xlsx`) and `.csv` corporate filings with schema validation and type coercion.
- **1-Click Demo Evaluation:** Instantly loads a curated 10-year enterprise dataset (`sample_financial_data.xlsx`) so recruiters and reviewers can test the entire pipeline in 1 click without preparing files.
- **18 Foundational Ratios Engine:** Calculates profitability (Gross, Operating, Net Margin, ROE, ROA, ROCE), liquidity (Current, Quick, OCF Ratio), efficiency (Receivables Turnover, Inventory Turnover, Asset Turnover, Cash Conversion Cycle), and leverage (D/E, D/A, Interest Coverage).
- **7 Deterministic Forensic Rules (A–G):**
  - **Rule A:** Revenue growth vs. Receivables divergence
  - **Rule B:** Net profit growth vs. Operating Cash Flow divergence
  - **Rule C:** Inventory growth vs. COGS divergence
  - **Rule D:** Unexplained Gross Margin spikes
  - **Rule E:** Related-Party Transaction spikes
  - **Rule F:** Capex growth vs. Depreciation divergence
  - **Rule G:** Increasing Debt with Declining Cash Flow
- **Composite Risk Scoring (0–100):** Weighted risk scoring normalized across multi-year anomaly counts, classifying entities into Low, Moderate, or High risk tiers.
- **Open AI Architecture (Any Provider):** Works seamlessly with **any** OpenAI-compatible inference provider:
  - **Groq** (Llama 3.3 70B Versatile, Mixtral)
  - **OpenRouter** (Claude, Mistral, Gemma)
  - **DeepSeek** (DeepSeek-Chat, DeepSeek-Reasoner)
  - **Ollama / Local LLMs** (`http://localhost:11434/v1`)
  - **OpenAI** (GPT-4o, GPT-4o-mini)
- **Zero-Storage Floating Keys:** Browser API keys and base URLs are strictly tab-isolated (`sessionStorage`) and sent on-demand via headers—never stored in databases or `localStorage`.
- **Hardened Authentication:** Production-ready `httpOnly`, `SameSite=Lax` JWT authentication with route protection.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| **UI System** | React Bits inspired components (SpotlightCard, AnimatedCounter, ShinyBadge, AnimatedTabs) |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic v2, Uvicorn |
| **Database** | SQLite (development/portfolio), PostgreSQL ready via SQLAlchemy |
| **AI Layer** | Universal OpenAI API Client (Groq, OpenRouter, DeepSeek, Ollama, OpenAI) + Audited Heuristics |

---

## Quick Start (Local Setup)

### 1. Backend Service
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (Swagger docs at `/docs`).

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Cloud Deployment (Vercel + Backend)

### Deploying Frontend to Vercel
1. Push this repository to your GitHub account.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Configure the **Root Directory** as `frontend`.
4. Add the following environment variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://your-backend.railway.app` or `https://your-backend.onrender.com`).
5. Click **Deploy**.

### Deploying Backend (Render, Railway, or Fly.io)
1. Point your deployment root to the `backend/` directory.
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Provide environment variables:
   - `SECRET_KEY`: A secure random string for JWT hashing
   - `FRONTEND_URL`: Your Vercel frontend URL (for CORS)
   - `AI_API_KEY` (Optional): Server-level fallback AI key

---

## How to Test Without an API Key

1. **Sign In:** Go to `/login` (or create a test account at `/signup`).
2. **Click "Load 10-Yr Demo Dataset":** Located directly in the top navigation or on the homepage.
3. **Instant Forensic Results:** The application immediately displays the complete 10-year audit dossier, 18 calculated financial ratios, visual anomaly trends, and rule-by-rule forensic explanations. If no external AI key is supplied, audited forensic expert heuristics automatically generate detailed diagnostic recommendations.

---

## Configuring an AI Provider

Navigate to **Settings → AI Engine Configuration** or click **API Key** in the top navigation to select your preferred provider:

| Provider | Base URL | Recommended Model |
| :--- | :--- | :--- |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat` |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` |
| **Ollama (Local)** | `http://localhost:11434/v1` | `llama3:8b` |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` |

Click **Test Connection** to verify your key and endpoint in real-time.

---

## Project Structure

```
financial-fraud-detector/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application & middleware
│   │   ├── config.py               # Settings & open AI provider configurations
│   │   ├── database.py             # SQLAlchemy database session
│   │   ├── models/                 # ORM models (User, Company, FinancialData, Ratio, Anomaly)
│   │   ├── routers/                # API endpoints (auth, upload, analyze, companies)
│   │   ├── schemas/                # Pydantic schemas & response models
│   │   └── services/               # Ratio calculations, Anomaly detection (A-G), AI explanations
│   ├── tests/                      # Verification test suites & regression benchmarks
│   └── requirements.txt
├── frontend/
│   ├── app/                        # Next.js 16 App Router (Home, Dashboard, Companies, Upload, Settings)
│   ├── components/                 # Application components
│   │   └── react-bits/             # SpotlightCard, AnimatedCounter, ShinyBadge, AnimatedTabs
│   ├── lib/                        # API client, types, multi-provider key manager
│   └── public/                     # Static assets & sample dataset
├── docs/                           # Documentation & design concept notes
└── README.md                       # Portfolio documentation
```

---

## Disclaimer

> **Academic & Audit Screening Tool:** This platform detects mathematical, statistical, and structural divergences within submitted financial statements. It does not issue legal verdicts of intentional fraud. All generated scores and explanations are designed to guide professional auditors and academic researchers.

---

## License

This project is open-source under the [MIT License](LICENSE).

