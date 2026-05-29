from pydantic import BaseModel, Field
from typing import List, Optional

class TripRequest(BaseModel):
    destination: str = Field(..., description="Target city/country for the trip")
    days: int = Field(..., description="Number of days for the trip")
    budget: float = Field(..., description="Total budget in USD or local currency equivalent")
    travelStyle: str = Field(..., description="Travel style (e.g., luxury, budget, adventure, balanced, slow)")
    interests: List[str] = Field(default=[], description="User interests, e.g. food, history, shopping, nature")
    travelers: int = Field(default=1, description="Number of travelers")

class DayPlan(BaseModel):
    day: int = Field(..., description="Day number of the trip")
    title: str = Field(..., description="Title/Theme for the day")
    activities: List[str] = Field(..., description="List of activities planned for this day")
    estimatedCost: float = Field(..., description="Estimated cost for this day")

class ItineraryResponse(BaseModel):
    tripTitle: str = Field(..., description="A catchy title for the trip")
    summary: str = Field(..., description="A brief introductory summary of the itinerary")
    destination: str = Field(..., description="Destination location")
    days: int = Field(..., description="Total days")
    budget: float = Field(..., description="Total budget allocated")
    travelStyle: str = Field(..., description="Final travel style classification")
    itinerary: List[DayPlan] = Field(..., description="Day-by-day activities and cost estimates")

class ItineraryEditRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travelStyle: str
    interests: List[str]
    travelers: int
    editInstruction: str = Field(..., description="Instructions on how to change/regenerate the itinerary")
    previousItinerary: ItineraryResponse = Field(..., description="The previous full itinerary to modify")
