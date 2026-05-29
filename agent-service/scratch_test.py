import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key Starts With: {api_key[:10] if api_key else 'None'}")

try:
    client = genai.Client(api_key=api_key)
    print("\n--- Listing Models via google-genai ---")
    response = client.models.list()
    for m in response:
        print(f"- {m.name}")
except Exception as e:
    print("Error listing models:", str(e))
