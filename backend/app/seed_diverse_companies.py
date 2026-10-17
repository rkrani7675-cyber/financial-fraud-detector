"""
Script to seed diverse, realistic corporate financial profiles into SQLite database.
Ensures varied company names, timelines (4, 5, 6, 7, 8, 10 years), risk scores (Low, Moderate, High),
and clean financial ratios/anomalies while preserving existing test anchor Company ID 4.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.models import Company, FinancialData, Ratio, Anomaly, RiskScore, Explanation
from app.services import calculate_company_ratios, detect_anomalies, calculate_risk_score, generate_explanation

def seed_database():
    db = SessionLocal()
    try:
        # 1. Clean up duplicate test companies (Lifecycle Verified Corp, etc.) except ID 4 (Apex Global Holdings Ltd.)
        test_comps = db.query(Company).filter(
            (Company.name.like("Lifecycle Verified Corp%")) |
            (Company.name.like("Vance Forensic%")) |
            (Company.id.in_([1, 2, 3]))
        ).all()

        for comp in test_comps:
            db.query(FinancialData).filter(FinancialData.company_id == comp.id).delete()
            db.query(Ratio).filter(Ratio.company_id == comp.id).delete()
            db.query(Anomaly).filter(Anomaly.company_id == comp.id).delete()
            db.query(RiskScore).filter(RiskScore.company_id == comp.id).delete()
            db.query(Explanation).filter(Explanation.company_id == comp.id).delete()
            db.delete(comp)
        db.commit()

        # Define diverse corporate datasets
        diverse_companies = [
            {
                "name": "NovaTech Solutions Inc.",
                "records": [
                    {"year": 2020, "revenue": 100.0, "cogs": 35.0, "operating_expenses": 30.0, "net_profit": 28.0, "receivables": 15.0, "inventory": 5.0, "total_assets": 140.0, "total_debt": 20.0, "equity": 110.0, "operating_cash_flow": 32.0, "capex": 8.0, "depreciation": 6.0, "current_assets": 60.0, "current_liabilities": 25.0, "related_party_transactions": 0.0, "interest_expense": 1.0},
                    {"year": 2021, "revenue": 125.0, "cogs": 42.0, "operating_expenses": 38.0, "net_profit": 36.0, "receivables": 19.0, "inventory": 6.0, "total_assets": 175.0, "total_debt": 22.0, "equity": 138.0, "operating_cash_flow": 40.0, "capex": 10.0, "depreciation": 8.0, "current_assets": 75.0, "current_liabilities": 28.0, "related_party_transactions": 0.0, "interest_expense": 1.2},
                    {"year": 2022, "revenue": 155.0, "cogs": 50.0, "operating_expenses": 45.0, "net_profit": 48.0, "receivables": 24.0, "inventory": 7.0, "total_assets": 220.0, "total_debt": 25.0, "equity": 175.0, "operating_cash_flow": 52.0, "capex": 12.0, "depreciation": 10.0, "current_assets": 95.0, "current_liabilities": 32.0, "related_party_transactions": 0.0, "interest_expense": 1.5},
                    {"year": 2023, "revenue": 190.0, "cogs": 60.0, "operating_expenses": 55.0, "net_profit": 60.0, "receivables": 29.0, "inventory": 8.0, "total_assets": 275.0, "total_debt": 25.0, "equity": 225.0, "operating_cash_flow": 66.0, "capex": 15.0, "depreciation": 12.0, "current_assets": 120.0, "current_liabilities": 38.0, "related_party_transactions": 0.0, "interest_expense": 1.5},
                    {"year": 2024, "revenue": 230.0, "cogs": 72.0, "operating_expenses": 65.0, "net_profit": 74.0, "receivables": 35.0, "inventory": 10.0, "total_assets": 340.0, "total_debt": 30.0, "equity": 285.0, "operating_cash_flow": 80.0, "capex": 18.0, "depreciation": 15.0, "current_assets": 155.0, "current_liabilities": 45.0, "related_party_transactions": 0.0, "interest_expense": 1.8},
                ]
            },
            {
                "name": "Crestview BioPharma Corp.",
                "records": [
                    {"year": 2018, "revenue": 80.0, "cogs": 28.0, "operating_expenses": 35.0, "net_profit": 13.0, "receivables": 14.0, "inventory": 12.0, "total_assets": 110.0, "total_debt": 25.0, "equity": 75.0, "operating_cash_flow": 15.0, "capex": 8.0, "depreciation": 5.0, "current_assets": 45.0, "current_liabilities": 20.0, "related_party_transactions": 0.0, "interest_expense": 1.5},
                    {"year": 2019, "revenue": 95.0, "cogs": 32.0, "operating_expenses": 42.0, "net_profit": 16.0, "receivables": 18.0, "inventory": 15.0, "total_assets": 130.0, "total_debt": 30.0, "equity": 88.0, "operating_cash_flow": 17.0, "capex": 10.0, "depreciation": 7.0, "current_assets": 52.0, "current_liabilities": 24.0, "related_party_transactions": 0.0, "interest_expense": 1.8},
                    {"year": 2020, "revenue": 115.0, "cogs": 38.0, "operating_expenses": 50.0, "net_profit": 20.0, "receivables": 23.0, "inventory": 19.0, "total_assets": 160.0, "total_debt": 40.0, "equity": 105.0, "operating_cash_flow": 19.0, "capex": 14.0, "depreciation": 9.0, "current_assets": 65.0, "current_liabilities": 30.0, "related_party_transactions": 0.0, "interest_expense": 2.2},
                    {"year": 2021, "revenue": 140.0, "cogs": 42.0, "operating_expenses": 60.0, "net_profit": 30.0, "receivables": 32.0, "inventory": 28.0, "total_assets": 200.0, "total_debt": 55.0, "equity": 128.0, "operating_cash_flow": 22.0, "capex": 22.0, "depreciation": 11.0, "current_assets": 82.0, "current_liabilities": 38.0, "related_party_transactions": 0.0, "interest_expense": 3.0},
                    {"year": 2022, "revenue": 175.0, "cogs": 48.0, "operating_expenses": 72.0, "net_profit": 44.0, "receivables": 45.0, "inventory": 42.0, "total_assets": 260.0, "total_debt": 75.0, "equity": 162.0, "operating_cash_flow": 25.0, "capex": 35.0, "depreciation": 14.0, "current_assets": 110.0, "current_liabilities": 48.0, "related_party_transactions": 0.0, "interest_expense": 4.5},
                    {"year": 2023, "revenue": 210.0, "cogs": 55.0, "operating_expenses": 85.0, "net_profit": 55.0, "receivables": 60.0, "inventory": 58.0, "total_assets": 330.0, "total_debt": 105.0, "equity": 198.0, "operating_cash_flow": 28.0, "capex": 48.0, "depreciation": 18.0, "current_assets": 142.0, "current_liabilities": 60.0, "related_party_transactions": 0.0, "interest_expense": 6.2},
                    {"year": 2024, "revenue": 250.0, "cogs": 62.0, "operating_expenses": 100.0, "net_profit": 68.0, "receivables": 78.0, "inventory": 75.0, "total_assets": 410.0, "total_debt": 140.0, "equity": 242.0, "operating_cash_flow": 32.0, "capex": 60.0, "depreciation": 22.0, "current_assets": 180.0, "current_liabilities": 75.0, "related_party_transactions": 0.0, "interest_expense": 8.0},
                ]
            },
            {
                "name": "BlueSky Logistics Group",
                "records": [
                    {"year": 2021, "revenue": 210.0, "cogs": 150.0, "operating_expenses": 35.0, "net_profit": 19.0, "receivables": 32.0, "inventory": 12.0, "total_assets": 220.0, "total_debt": 60.0, "equity": 140.0, "operating_cash_flow": 25.0, "capex": 18.0, "depreciation": 14.0, "current_assets": 70.0, "current_liabilities": 40.0, "related_party_transactions": 0.0, "interest_expense": 3.0},
                    {"year": 2022, "revenue": 235.0, "cogs": 168.0, "operating_expenses": 38.0, "net_profit": 22.0, "receivables": 36.0, "inventory": 14.0, "total_assets": 245.0, "total_debt": 65.0, "equity": 155.0, "operating_cash_flow": 29.0, "capex": 20.0, "depreciation": 16.0, "current_assets": 78.0, "current_liabilities": 44.0, "related_party_transactions": 0.0, "interest_expense": 3.2},
                    {"year": 2023, "revenue": 265.0, "cogs": 188.0, "operating_expenses": 42.0, "net_profit": 26.0, "receivables": 40.0, "inventory": 15.0, "total_assets": 275.0, "total_debt": 70.0, "equity": 174.0, "operating_cash_flow": 34.0, "capex": 22.0, "depreciation": 18.0, "current_assets": 88.0, "current_liabilities": 48.0, "related_party_transactions": 0.0, "interest_expense": 3.5},
                    {"year": 2024, "revenue": 295.0, "cogs": 210.0, "operating_expenses": 46.0, "net_profit": 30.0, "receivables": 45.0, "inventory": 17.0, "total_assets": 310.0, "total_debt": 75.0, "equity": 195.0, "operating_cash_flow": 39.0, "capex": 25.0, "depreciation": 20.0, "current_assets": 100.0, "current_liabilities": 52.0, "related_party_transactions": 0.0, "interest_expense": 3.8},
                ]
            },
            {
                "name": "Veritas Heavy Industries Ltd.",
                "records": [
                    {"year": 2017, "revenue": 300.0, "cogs": 210.0, "operating_expenses": 45.0, "net_profit": 35.0, "receivables": 40.0, "inventory": 50.0, "total_assets": 380.0, "total_debt": 90.0, "equity": 240.0, "operating_cash_flow": 42.0, "capex": 25.0, "depreciation": 18.0, "current_assets": 120.0, "current_liabilities": 65.0, "related_party_transactions": 0.0, "interest_expense": 4.5},
                    {"year": 2018, "revenue": 330.0, "cogs": 232.0, "operating_expenses": 48.0, "net_profit": 38.0, "receivables": 52.0, "inventory": 58.0, "total_assets": 420.0, "total_debt": 110.0, "equity": 265.0, "operating_cash_flow": 38.0, "capex": 30.0, "depreciation": 20.0, "current_assets": 135.0, "current_liabilities": 75.0, "related_party_transactions": 0.0, "interest_expense": 5.5},
                    {"year": 2019, "revenue": 370.0, "cogs": 260.0, "operating_expenses": 52.0, "net_profit": 43.0, "receivables": 68.0, "inventory": 68.0, "total_assets": 470.0, "total_debt": 135.0, "equity": 290.0, "operating_cash_flow": 32.0, "capex": 38.0, "depreciation": 22.0, "current_assets": 155.0, "current_liabilities": 88.0, "related_party_transactions": 0.0, "interest_expense": 7.0},
                    {"year": 2020, "revenue": 410.0, "cogs": 290.0, "operating_expenses": 58.0, "net_profit": 48.0, "receivables": 88.0, "inventory": 82.0, "total_assets": 530.0, "total_debt": 170.0, "equity": 315.0, "operating_cash_flow": 24.0, "capex": 45.0, "depreciation": 25.0, "current_assets": 180.0, "current_liabilities": 105.0, "related_party_transactions": 0.0, "interest_expense": 9.0},
                    {"year": 2021, "revenue": 455.0, "cogs": 325.0, "operating_expenses": 65.0, "net_profit": 52.0, "receivables": 115.0, "inventory": 98.0, "total_assets": 600.0, "total_debt": 220.0, "equity": 340.0, "operating_cash_flow": 16.0, "capex": 55.0, "depreciation": 28.0, "current_assets": 210.0, "current_liabilities": 125.0, "related_party_transactions": 0.0, "interest_expense": 12.0},
                    {"year": 2022, "revenue": 505.0, "cogs": 365.0, "operating_expenses": 72.0, "net_profit": 56.0, "receivables": 150.0, "inventory": 118.0, "total_assets": 680.0, "total_debt": 285.0, "equity": 365.0, "operating_cash_flow": 8.0, "capex": 68.0, "depreciation": 32.0, "current_assets": 245.0, "current_liabilities": 150.0, "related_party_transactions": 0.0, "interest_expense": 16.0},
                    {"year": 2023, "revenue": 560.0, "cogs": 410.0, "operating_expenses": 80.0, "net_profit": 60.0, "receivables": 195.0, "inventory": 142.0, "total_assets": 770.0, "total_debt": 360.0, "equity": 385.0, "operating_cash_flow": -4.0, "capex": 80.0, "depreciation": 36.0, "current_assets": 285.0, "current_liabilities": 180.0, "related_party_transactions": 0.0, "interest_expense": 22.0},
                    {"year": 2024, "revenue": 620.0, "cogs": 460.0, "operating_expenses": 90.0, "net_profit": 62.0, "receivables": 250.0, "inventory": 172.0, "total_assets": 880.0, "total_debt": 450.0, "equity": 400.0, "operating_cash_flow": -18.0, "capex": 95.0, "depreciation": 40.0, "current_assets": 330.0, "current_liabilities": 220.0, "related_party_transactions": 0.0, "interest_expense": 29.0},
                ]
            },
            {
                "name": "Horizon Retail Partners",
                "records": [
                    {"year": 2019, "revenue": 140.0, "cogs": 95.0, "operating_expenses": 28.0, "net_profit": 13.0, "receivables": 12.0, "inventory": 30.0, "total_assets": 135.0, "total_debt": 35.0, "equity": 82.0, "operating_cash_flow": 16.0, "capex": 8.0, "depreciation": 6.0, "current_assets": 52.0, "current_liabilities": 26.0, "related_party_transactions": 0.0, "interest_expense": 1.8},
                    {"year": 2020, "revenue": 155.0, "cogs": 105.0, "operating_expenses": 30.0, "net_profit": 15.0, "receivables": 14.0, "inventory": 35.0, "total_assets": 150.0, "total_debt": 40.0, "equity": 90.0, "operating_cash_flow": 17.0, "capex": 9.0, "depreciation": 7.0, "current_assets": 58.0, "current_liabilities": 29.0, "related_party_transactions": 0.0, "interest_expense": 2.0},
                    {"year": 2021, "revenue": 175.0, "cogs": 118.0, "operating_expenses": 34.0, "net_profit": 18.0, "receivables": 17.0, "inventory": 42.0, "total_assets": 172.0, "total_debt": 46.0, "equity": 102.0, "operating_cash_flow": 19.0, "capex": 11.0, "depreciation": 8.0, "current_assets": 68.0, "current_liabilities": 34.0, "related_party_transactions": 0.0, "interest_expense": 2.4},
                    {"year": 2022, "revenue": 198.0, "cogs": 132.0, "operating_expenses": 38.0, "net_profit": 21.0, "receivables": 20.0, "inventory": 56.0, "total_assets": 200.0, "total_debt": 55.0, "equity": 116.0, "operating_cash_flow": 15.0, "capex": 13.0, "depreciation": 10.0, "current_assets": 82.0, "current_liabilities": 40.0, "related_party_transactions": 0.0, "interest_expense": 3.0},
                    {"year": 2023, "revenue": 222.0, "cogs": 148.0, "operating_expenses": 43.0, "net_profit": 24.0, "receivables": 24.0, "inventory": 72.0, "total_assets": 235.0, "total_debt": 66.0, "equity": 132.0, "operating_cash_flow": 14.0, "capex": 15.0, "depreciation": 11.0, "current_assets": 98.0, "current_liabilities": 48.0, "related_party_transactions": 0.0, "interest_expense": 3.5},
                    {"year": 2024, "revenue": 250.0, "cogs": 165.0, "operating_expenses": 48.0, "net_profit": 28.0, "receivables": 28.0, "inventory": 92.0, "total_assets": 275.0, "total_debt": 80.0, "equity": 150.0, "operating_cash_flow": 16.0, "capex": 18.0, "depreciation": 13.0, "current_assets": 118.0, "current_liabilities": 56.0, "related_party_transactions": 0.0, "interest_expense": 4.2},
                ]
            }
        ]

        for item in diverse_companies:
            existing = db.query(Company).filter(Company.name == item["name"]).first()
            if existing:
                comp_id = existing.id
                db.query(FinancialData).filter(FinancialData.company_id == comp_id).delete()
                db.query(Ratio).filter(Ratio.company_id == comp_id).delete()
                db.query(Anomaly).filter(Anomaly.company_id == comp_id).delete()
                db.query(RiskScore).filter(RiskScore.company_id == comp_id).delete()
                db.query(Explanation).filter(Explanation.company_id == comp_id).delete()
            else:
                comp = Company(name=item["name"], user_id=1)
                db.add(comp)
                db.commit()
                db.refresh(comp)
                comp_id = comp.id

            records = item["records"]
            for r in records:
                db.add(FinancialData(company_id=comp_id, **r))
            db.commit()

            # Ratios
            calculated_ratios = calculate_company_ratios(records)
            for r in calculated_ratios:
                db.add(Ratio(company_id=comp_id, **r))
            db.commit()

            # Anomalies
            detected = detect_anomalies(records, calculated_ratios)
            created_anomalies = []
            for a in detected:
                anom = Anomaly(company_id=comp_id, **a)
                db.add(anom)
                created_anomalies.append(anom)
            db.commit()

            # Score & Level
            score, risk_level = calculate_risk_score(detected)
            db.add(RiskScore(company_id=comp_id, score=score, risk_level=risk_level))
            db.commit()

            # Explanations
            for anom in created_anomalies:
                expl_data = generate_explanation(
                    anomaly_type=anom.anomaly_type,
                    name=anom.name,
                    description=anom.description,
                    year=anom.year,
                    company_name=item["name"],
                    risk_points=anom.risk_points
                )
                db.add(Explanation(company_id=comp_id, anomaly_id=anom.id, **expl_data))
            db.commit()

            print(f"Seeded: {item['name']} (ID {comp_id}) -> {len(records)} Years, Score {score}/100 ({risk_level} Risk), {len(detected)} Anomalies")

        print("Finished seeding diverse companies successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
