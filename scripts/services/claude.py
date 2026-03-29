import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def analyze_deal_risk(deal_data):
    prompt = f"""
    You are an expert sales analyst. Analyze this deal and return a risk assessment.

    Deal Information:
    - Company: {deal_data['name']}
    - Deal Value: {deal_data['amount']}
    - Current Stage: {deal_data['stage']}
    - Days Since Last Modified: {deal_data['days_inactive']}
    - Notes/Description: {deal_data['description']}
    - Expected Close Date: {deal_data['closedate']}

    Return your analysis in this EXACT format:
    RISK_SCORE: [number 0-100]
    RISK_LEVEL: [HIGH / MEDIUM / LOW]
    TOP_REASONS:
    - [reason 1]
    - [reason 2]
    - [reason 3]
    RECOVERY_EMAIL:
    Subject: [email subject]
    Body: [2-3 sentence email body]
    NEXT_ACTION: [one specific thing the salesperson should do today]
    """

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    return parse_risk_response(message.content[0].text)


def parse_risk_response(text):
    lines = text.strip().split('\n')
    result = {
        "score": 50,
        "level": "MEDIUM",
        "reasons": [],
        "email_subject": "",
        "email_body": "",
        "next_action": ""
    }

    current_section = None

    for line in lines:
        line = line.strip()

        if line.startswith("RISK_SCORE:"):
            try:
                result["score"] = int(line.split(":")[1].strip())
            except:
                result["score"] = 50

        elif line.startswith("RISK_LEVEL:"):
            result["level"] = line.split(":")[1].strip()

        elif line.startswith("TOP_REASONS:"):
            current_section = "reasons"

        elif line.startswith("RECOVERY_EMAIL:"):
            current_section = "email"

        elif line.startswith("Subject:") and current_section == "email":
            result["email_subject"] = line.replace("Subject:", "").strip()

        elif line.startswith("Body:") and current_section == "email":
            result["email_body"] = line.replace("Body:", "").strip()

        elif line.startswith("NEXT_ACTION:"):
            result["next_action"] = line.replace("NEXT_ACTION:", "").strip()
            current_section = None

        elif line.startswith("- ") and current_section == "reasons":
            result["reasons"].append(line[2:])

    return result


def generate_prospect_email(company_info):
    prompt = f"""
    You are an expert B2B sales copywriter.
    
    Write a personalized cold outreach email for this prospect:
    Company: {company_info['name']}
    Industry: {company_info.get('industry', 'Technology')}
    Size: {company_info.get('size', 'Unknown')}
    Website Info: {company_info.get('website_content', 'Not available')}
    Recent News: {company_info.get('news', 'None found')}
    
    Requirements:
    - Under 100 words
    - Reference something specific about their company
    - Clear value proposition
    - One specific call to action
    - Natural, human tone — not salesy
    
    Return ONLY:
    SUBJECT: [subject line]
    BODY: [email body]
    FIT_SCORE: [0-100]
    FIT_REASON: [one sentence why they are a good fit]
    """

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return parse_prospect_response(message.content[0].text)


def parse_prospect_response(text):
    result = {
        "subject": "",
        "body": "",
        "fit_score": 0,
        "fit_reason": ""
    }

    for line in text.strip().split('\n'):
        line = line.strip()
        if line.startswith("SUBJECT:"):
            result["subject"] = line.replace("SUBJECT:", "").strip()
        elif line.startswith("BODY:"):
            result["body"] = line.replace("BODY:", "").strip()
        elif line.startswith("FIT_SCORE:"):
            try:
                result["fit_score"] = int(line.split(":")[1].strip())
            except:
                result["fit_score"] = 50
        elif line.startswith("FIT_REASON:"):
            result["fit_reason"] = line.replace("FIT_REASON:", "").strip()

    return result