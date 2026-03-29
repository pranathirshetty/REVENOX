import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("HUBSPOT_API_KEY")
BASE = "https://api.hubapi.com"

def get_all_deals():
    url = f"{BASE}/crm/v3/objects/deals"
    params = {
        "hapikey": API_KEY,
        "properties": [
            "dealname",
            "amount",
            "dealstage",
            "closedate",
            "description",
            "hs_lastmodifieddate",
            "notes_last_contacted",
            "num_notes"
        ],
        "limit": 50
    }
    response = requests.get(url, params=params)
    return response.json().get("results", [])


def get_deal_by_id(deal_id):
    url = f"{BASE}/crm/v3/objects/deals/{deal_id}"
    params = {
        "hapikey": API_KEY,
        "properties": "dealname,amount,dealstage,description,closedate"
    }
    response = requests.get(url, params=params)
    return response.json()


def update_deal_description(deal_id, new_description):
    url = f"{BASE}/crm/v3/objects/deals/{deal_id}"
    params = {"hapikey": API_KEY}
    body = {
        "properties": {
            "description": new_description
        }
    }
    response = requests.patch(url, params=params, json=body)
    return response.json()


def get_all_contacts():
    url = f"{BASE}/crm/v3/objects/contacts"
    params = {
        "hapikey": API_KEY,
        "properties": "firstname,lastname,email,company,jobtitle",
        "limit": 50
    }
    response = requests.get(url, params=params)
    return response.json().get("results", [])