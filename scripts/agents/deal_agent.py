from ..services.hubspot import get_all_deals
from ..services.claude import analyze_deal_risk
from datetime import datetime, timezone

def calculate_days_inactive(last_modified):
    if not last_modified:
        return 999
    
    last = datetime.fromisoformat(
        last_modified.replace('Z', '+00:00')
    )
    now = datetime.now(timezone.utc)
    return (now - last).days


def run_deal_intelligence():
    print("🤖 Deal Intelligence Agent running...")
    
    # 1. Fetch all deals from HubSpot
    raw_deals = get_all_deals()
    
    if not raw_deals:
        print("No deals found in HubSpot")
        return []
    
    results = []
    
    for deal in raw_deals:
        props = deal["properties"]
        
        # 2. Structure deal data
        deal_data = {
            "id": deal["id"],
            "name": props.get("dealname", "Unknown Deal"),
            "amount": props.get("amount", "0"),
            "stage": props.get("dealstage", "unknown"),
            "description": props.get("description", "No notes available"),
            "closedate": props.get("closedate", "Not set"),
            "days_inactive": calculate_days_inactive(
                props.get("hs_lastmodifieddate")
            )
        }
        
        print(f"Analyzing: {deal_data['name']}...")
        
        # 3. Send to Claude for risk analysis
        risk = analyze_deal_risk(deal_data)
        
        # 4. Combine everything
        full_result = {
            **deal_data,
            "risk_score": risk["score"],
            "risk_level": risk["level"],
            "risk_reasons": risk["reasons"],
            "recovery_email_subject": risk["email_subject"],
            "recovery_email_body": risk["email_body"],
            "next_action": risk["next_action"]
        }
        
        results.append(full_result)
        
        print(f"  ✓ Risk: {risk['level']} ({risk['score']}/100)")
    
    # Sort by risk score — highest risk first
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    
    print(f"\n✅ Analyzed {len(results)} deals")
    print(f"🔴 High Risk: {sum(1 for r in results if r['risk_score'] >= 70)}")
    print(f"🟡 Medium Risk: {sum(1 for r in results if 40 <= r['risk_score'] < 70)}")
    print(f"🟢 Low Risk: {sum(1 for r in results if r['risk_score'] < 40)}")
    
    return results


# Test it directly
if __name__ == "__main__":
    results = run_deal_intelligence()
    for deal in results:
        print(f"\n{deal['name']}")
        print(f"Risk: {deal['risk_level']} - {deal['risk_score']}/100")
        print(f"Reasons: {deal['risk_reasons']}")
        print(f"Next Action: {deal['next_action']}")