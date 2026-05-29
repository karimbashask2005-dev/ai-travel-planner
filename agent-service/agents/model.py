import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

def get_model(temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    """
    Initializes and returns the ChatGoogleGenerativeAI instance using the model name 
    specified in environment variables, defaulting to gemini-1.5-flash.
    """
    model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash")
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in the environment variables.")
        
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        google_api_key=api_key
    )
