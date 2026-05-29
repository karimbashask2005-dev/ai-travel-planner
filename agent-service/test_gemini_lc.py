import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

class TestSchema(BaseModel):
    name: str = Field(..., description="A test name")

try:
    print("Initializing ChatGoogleGenerativeAI with gemini-flash-latest...")
    llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=api_key)
    structured_llm = llm.with_structured_output(TestSchema)
    res = structured_llm.invoke("Generate a test name: 'Voyager'")
    print("Success! Result:", res)
except Exception as e:
    print("Failed:", str(e))
