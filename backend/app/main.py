import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from app.config import settings
from app.database import init_db
from app.routers import upload, analyze, company, auth

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ffd.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SQLite database schema...")
    init_db()
    logger.info("Database schema initialized and verified.")
    yield
    logger.info("Backend service shutting down.")

# Ensure DB schema is initialized
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Financial Fraud Detector - An AI-Assisted Financial Statement Anomaly Detection System",
    lifespan=lifespan
)

# Global unhandled exception handler: fail loud, log traceback, return 500
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Configure CORS
origins = settings.cors_origins_list
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include primary routers directly (fails fast and loud if missing or misconfigured)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX, tags=["Auth"])
app.include_router(upload.router, prefix=settings.API_V1_PREFIX, tags=["Upload"])
app.include_router(analyze.router, prefix=settings.API_V1_PREFIX, tags=["Analysis"])
app.include_router(company.router, prefix=settings.API_V1_PREFIX, tags=["Companies"])

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <!DOCTYPE html>
    <html>
      <head>
        <title>Financial Fraud Detector - API Service</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020617; color: #f8fafc; padding: 40px; text-align: center; margin: 0; }
          .card { max-width: 620px; margin: 40px auto; background: #0f172a; padding: 36px; border-radius: 20px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          h1 { color: #f43f5e; margin: 0 0 10px; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          .btn-group { display: flex; flex-direction: column; gap: 10px; max-width: 380px; margin: 0 auto; }
          .btn { display: block; padding: 12px 20px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; transition: all 0.2s; }
          .btn-primary { background: linear-gradient(135deg, #f43f5e, #6366f1); color: white; box-shadow: 0 10px 15px -3px rgba(244,63,94,0.3); }
          .btn-secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
          .btn:hover { opacity: 0.95; transform: translateY(-1px); }
          .meta { font-family: monospace; font-size: 11px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Financial Fraud Detector API</h1>
          <p>
            You have accessed the <strong>Backend REST API Service</strong> on port 8000.
            To use the visual user interface, open the <strong>Frontend Dashboard on port 3000</strong>.
          </p>
          <div class="btn-group">
            <a href="http://localhost:3000" class="btn btn-primary">Open Interactive Dashboard (Port 3000)</a>
            <a href="/docs" class="btn btn-secondary">Open Swagger API Docs (Port 8000)</a>
            <a href="/health" class="btn btn-secondary">System Health Check</a>
          </div>
          <div class="meta">
            FastAPI 0.143 • SQLite: backend/ffd.db • API Prefix: /api/v1
          </div>
        </div>
      </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0"
    }
