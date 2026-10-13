import io
import logging
from typing import List, Dict, Any, Tuple
import pandas as pd
from app.utils.validators import validate_columns, normalize_column_name, COLUMN_MAPPING

logger = logging.getLogger(__name__)

class DataExtractionError(Exception):
    def __init__(self, message: str, code: str = "EXTRACTION_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

def parse_financial_file(file_bytes: bytes, filename: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parse an Excel (.xlsx, .xls) or CSV (.csv) file into standardized financial rows.
    Returns (cleaned_rows, warnings).
    """
    filename_lower = filename.lower()
    logger.info(f"Initiating financial statement parsing for file '{filename}' ({len(file_bytes)} bytes)")
    
    try:
        if filename_lower.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        elif filename_lower.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            raise DataExtractionError(
                "Invalid file format. Please upload .xlsx, .xls, or .csv",
                code="INVALID_FILE_FORMAT"
            )
    except DataExtractionError:
        raise
    except Exception as e:
        logger.error(f"Failed to read/parse input file '{filename}': {e}", exc_info=True)
        raise DataExtractionError(f"Failed to parse file: {str(e)}", code="PARSE_ERROR") from e

    # Clean empty rows/cols
    df = df.dropna(how="all")
    if df.empty:
        logger.error(f"Uploaded file '{filename}' is empty.")
        raise DataExtractionError("The uploaded file contains no data.", code="EMPTY_FILE")

    # Map column headers
    raw_columns = [str(c).strip() for c in df.columns]
    is_valid, missing_cols = validate_columns(raw_columns)
    if not is_valid:
        logger.error(f"Missing required columns in '{filename}': {missing_cols}")
        raise DataExtractionError(
            f"Missing required columns: {', '.join(missing_cols)}",
            code="MISSING_COLUMNS"
        )

    # Rename columns to standard internal names
    column_rename_map = {}
    for col in df.columns:
        norm = normalize_column_name(str(col))
        if norm in COLUMN_MAPPING:
            column_rename_map[col] = COLUMN_MAPPING[norm]

    df = df.rename(columns=column_rename_map)

    # Validate years
    try:
        df["Year"] = df["Year"].astype(int)
    except (ValueError, TypeError) as err:
        logger.error(f"Year column validation failed in '{filename}': {err}", exc_info=True)
        raise DataExtractionError(
            "Year column must contain valid integers.",
            code="INVALID_YEAR_FORMAT"
        ) from err

    # Deduplicate years and sort
    df = df.sort_values(by="Year").drop_duplicates(subset=["Year"], keep="last")

    warnings: List[str] = []
    years_count = len(df)
    if years_count < 3:
        logger.error(f"Insufficient historical years in '{filename}': found {years_count}, minimum 3 required.")
        raise DataExtractionError(
            f"At least 3 years of historical financial data are required for anomaly analysis (found {years_count}).",
            code="INSUFFICIENT_DATA"
        )

    # Ensure all numeric fields are float and detect any corrupted strings
    numeric_fields = [
        "Revenue", "COGS", "NetProfit", "Receivables", "Inventory",
        "TotalAssets", "TotalDebt", "Equity", "OCF", "Capex", "Depreciation"
    ]
    for field in numeric_fields:
        if field in df.columns:
            original = df[field]
            coerced = pd.to_numeric(original, errors="coerce")
            bad_mask = original.notna() & coerced.isna() & (original.astype(str).str.strip() != "")
            bad_count = int(bad_mask.sum())
            if bad_count > 0:
                warning_msg = f"Non-numeric values in required column '{field}' at {bad_count} row(s) were coerced to 0.0."
                logger.warning(warning_msg)
                warnings.append(warning_msg)
            df[field] = coerced.fillna(0.0)

    # Optional fields default to 0.0
    optional_fields = {
        "OperatingExpenses": "operating_expenses",
        "RPT": "related_party_transactions",
        "Interest": "interest_expense",
        "CurrentAssets": "current_assets",
        "CurrentLiabilities": "current_liabilities"
    }
    for col_key in optional_fields.keys():
        if col_key in df.columns:
            original = df[col_key]
            coerced = pd.to_numeric(original, errors="coerce")
            bad_mask = original.notna() & coerced.isna() & (original.astype(str).str.strip() != "")
            bad_count = int(bad_mask.sum())
            if bad_count > 0:
                warning_msg = f"Non-numeric values in optional column '{col_key}' at {bad_count} row(s) were coerced to 0.0."
                logger.warning(warning_msg)
                warnings.append(warning_msg)
            df[col_key] = coerced.fillna(0.0)
        else:
            df[col_key] = 0.0

    # Convert to standard dictionary list
    records: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        record = {
            "year": int(row["Year"]),
            "revenue": float(row["Revenue"]),
            "cogs": float(row["COGS"]),
            "operating_expenses": float(row.get("OperatingExpenses", 0.0)),
            "net_profit": float(row["NetProfit"]),
            "receivables": float(row["Receivables"]),
            "inventory": float(row["Inventory"]),
            "total_assets": float(row["TotalAssets"]),
            "total_debt": float(row["TotalDebt"]),
            "equity": float(row["Equity"]),
            "operating_cash_flow": float(row["OCF"]),
            "capex": float(row["Capex"]),
            "depreciation": float(row["Depreciation"]),
            "related_party_transactions": float(row.get("RPT", 0.0)),
            "interest_expense": float(row.get("Interest", 0.0)),
            "current_assets": float(row.get("CurrentAssets", 0.0)),
            "current_liabilities": float(row.get("CurrentLiabilities", 0.0)),
        }
        records.append(record)

    logger.info(f"Successfully extracted {len(records)} financial records from '{filename}' ({len(warnings)} warnings).")
    return records, warnings
