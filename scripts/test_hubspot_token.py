import os
import requests
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Get the API key
api_key = os.getenv('HUBSPOT_API_KEY')

if not api_key:
    print("❌ Error: HUBSPOT_API_KEY not found in .env file")
    exit(1)

print(f"✓ Found API Key: {api_key[:15]}...{api_key[-15:]}")
print("\nTesting HubSpot connection...")

try:
    # Test the connection by getting account info
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
        headers=headers,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Token is VALID! ✓")
        print(f"Response: {response.json()}")
    elif response.status_code == 401:
        print("❌ Token authentication failed (401 Unauthorized)")
        print(f"Response: {response.json()}")
    else:
        print(f"⚠ Unexpected status code: {response.status_code}")
        print(f"Response: {response.json()}")
        
except Exception as e:
    print(f"❌ Error testing connection: {str(e)}")
    exit(1)
