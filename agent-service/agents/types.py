from typing import TypedDict, List, Optional, Any

class AgentState(TypedDict):
    # User inputs
    destination: str
    days: int
    budget: float
    travelStyle: str
    interests: List[str]
    travelers: int
    
    # Edit / Regeneration context
    edit_instruction: Optional[str]
    previous_itinerary: Optional[Any]  # Can be a dict or Pydantic model representation
    
    # Intermediate outputs
    planner_notes: Optional[str]
    weather_notes: Optional[str]
    budget_notes: Optional[str]
    
    # Final Structured output
    final_itinerary: Optional[Any]  # Final JSON or dict that matches ItineraryResponse
