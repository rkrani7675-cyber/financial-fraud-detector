from typing import List, Tuple

REQUIRED_COLUMNS = [
    "Year",
    "Revenue",
    "COGS",
    "NetProfit",
    "Receivables",
    "Inventory",
    "TotalAssets",
    "TotalDebt",
    "Equity",
    "OCF",
    "Capex",
    "Depreciation"
]

OPTIONAL_COLUMNS = [
    "OperatingExpenses",
    "RelatedPartyTransactions",
    "RPT",
    "InterestExpense",
    "Interest",
    "CurrentAssets",
    "CurrentLiabilities"
]

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def normalize_column_name(col: str) -> str:
    """Normalize column names by stripping spaces, underscores, and lowercasing."""
    return "".join(c for c in col.strip() if c.isalnum()).lower()

# Map normalized column names to standard keys
COLUMN_MAPPING = {
    "year": "Year",
    "revenue": "Revenue",
    "sales": "Revenue",
    "totalrevenue": "Revenue",
    "cogs": "COGS",
    "costofgoodssold": "COGS",
    "operatingexpenses": "OperatingExpenses",
    "opex": "OperatingExpenses",
    "netprofit": "NetProfit",
    "netincome": "NetProfit",
    "receivables": "Receivables",
    "accountsreceivable": "Receivables",
    "inventory": "Inventory",
    "inventories": "Inventory",
    "totalassets": "TotalAssets",
    "assets": "TotalAssets",
    "totaldebt": "TotalDebt",
    "debt": "TotalDebt",
    "equity": "Equity",
    "shareholdersequity": "Equity",
    "stockholdersequity": "Equity",
    "ocf": "OCF",
    "operatingcashflow": "OCF",
    "cashflowfromoperations": "OCF",
    "capex": "Capex",
    "capitalexpenditure": "Capex",
    "depreciation": "Depreciation",
    "depreciationandamortization": "Depreciation",
    "depr": "Depreciation",
    "relatedpartytransactions": "RPT",
    "rpt": "RPT",
    "relatedparty": "RPT",
    "interestexpense": "Interest",
    "interest": "Interest",
    "currentassets": "CurrentAssets",
    "currentliabilities": "CurrentLiabilities"
}

def validate_columns(columns: List[str]) -> Tuple[bool, List[str]]:
    """Validate that required financial columns exist in the dataset."""
    normalized_cols = {normalize_column_name(c): c for c in columns}
    mapped_keys = set()
    for norm_c in normalized_cols:
        if norm_c in COLUMN_MAPPING:
            mapped_keys.add(COLUMN_MAPPING[norm_c])

    missing = []
    for req in REQUIRED_COLUMNS:
        if req not in mapped_keys:
            missing.append(req)

    return (len(missing) == 0, missing)
