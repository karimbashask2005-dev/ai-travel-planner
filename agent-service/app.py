import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import TripRequest, ItineraryEditRequest, ItineraryResponse
from agents.workflow import itinerary_workflow

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="AI Travel Planner - Agent Service",
    description="Python FastAPI agent service powered by LangGraph, LangChain, and Open-Meteo Weather API"
)

# Enable CORS for communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Returns application status."""
    return {"status": "healthy", "service": "agent-service"}

@app.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: TripRequest):
    """
    Triggers the LangGraph multi-agent workflow to build a new travel itinerary.
    """
    logger.info(f"Generating new itinerary for {request.destination} ({request.days} days)")
    try:
        initial_state = {
            "destination": request.destination,
            "days": request.days,
            "budget": request.budget,
            "travelStyle": request.travelStyle,
            "interests": request.interests,
            "travelers": request.travelers,
            "edit_instruction": None,
            "previous_itinerary": None,
            "planner_notes": None,
            "weather_notes": None,
            "budget_notes": None,
            "final_itinerary": None
        }
        
        # Invoke the LangGraph workflow
        result = itinerary_workflow.invoke(initial_state)
        
        final_itinerary = result.get("final_itinerary")
        if not final_itinerary:
            raise HTTPException(status_code=500, detail="LangGraph workflow executed successfully but failed to construct a final itinerary.")
            
        logger.info("Successfully generated structured itinerary.")
        return final_itinerary
        
    except Exception as e:
        logger.error(f"Error during itinerary generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit-itinerary", response_model=ItineraryResponse)
async def edit_itinerary(request: ItineraryEditRequest):
    """
    Triggers the LangGraph workflow with an edit command and the previous itinerary state.
    """
    logger.info(f"Editing itinerary for {request.destination} with command: '{request.editInstruction}'")
    try:
        prev_itinerary_dict = request.previousItinerary.model_dump() if hasattr(request.previousItinerary, "model_dump") else request.previousItinerary
        
        initial_state = {
            "destination": request.destination,
            "days": request.days,
            "budget": request.budget,
            "travelStyle": request.travelStyle,
            "interests": request.interests,
            "travelers": request.travelers,
            "edit_instruction": request.editInstruction,
            "previous_itinerary": prev_itinerary_dict,
            "planner_notes": None,
            "weather_notes": None,
            "budget_notes": None,
            "final_itinerary": None
        }
        
        # Invoke the LangGraph workflow
        result = itinerary_workflow.invoke(initial_state)
        
        final_itinerary = result.get("final_itinerary")
        if not final_itinerary:
            raise HTTPException(status_code=500, detail="LangGraph workflow executed successfully but failed to regenerate the itinerary.")
            
        logger.info("Successfully edited and regenerated itinerary.")
        return final_itinerary
        
    except Exception as e:
        logger.error(f"Error during itinerary edit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting agent-service on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
