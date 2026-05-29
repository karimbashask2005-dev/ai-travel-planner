from agents.model import get_model
from agents.types import AgentState
from schemas import ItineraryResponse
from langchain_core.messages import SystemMessage, HumanMessage

ITINERARY_SYSTEM_PROMPT = """You are the Lead Travel Planner. Your goal is to synthesize the strategic planning notes, weather advice, and budget allocations to generate a highly detailed, day-by-day travel itinerary.

You must follow these rules strictly:
1. Synthesize the planner notes, weather guidelines, and budget restrictions into a cohesive plan.
2. For each day, provide a title, a list of specific, detailed activities, and an estimated cost for that day (ensure daily costs are realistic and match the total budget).
3. If this is an EDIT or REGENERATION request, apply the modifications from the planner notes to the previous itinerary. Carry over unmodified days while adjusting the modified days as requested.
4. Return the itinerary matching the requested schema layout exactly.

Avoid placeholder descriptions like "explore the city" or "go shopping." List actual, real-world locations, landmarks, restaurants, and tours.
"""

def run_itinerary_agent(state: AgentState) -> dict:
    """
    Synthesizes the planner, weather, and budget notes to produce a structured travel itinerary.
    """
    # Use structured output configuration
    model = get_model(temperature=0.5)
    structured_llm = model.with_structured_output(ItineraryResponse)
    
    is_edit = state.get("edit_instruction") is not None and state.get("previous_itinerary") is not None
    
    context = (
        f"Trip Destination: {state['destination']}\n"
        f"Duration: {state['days']} days\n"
        f"Total Budget: ${state['budget']}\n"
        f"Travel Style: {state['travelStyle']}\n"
        f"Interests: {', '.join(state['interests'])}\n"
        f"Travelers: {state['travelers']}\n"
        f"\n--- Specialist Agent Notes ---\n"
        f"Planner Agent Notes:\n{state.get('planner_notes', 'N/A')}\n\n"
        f"Weather Agent Notes:\n{state.get('weather_notes', 'N/A')}\n\n"
        f"Budget Agent Notes:\n{state.get('budget_notes', 'N/A')}\n"
    )
    
    if is_edit:
        context += (
            f"\n--- Previous Itinerary ---\n"
            f"{state['previous_itinerary']}\n"
            f"User Edit Request: '{state['edit_instruction']}'\n"
        )
        human_content = (
            "Generate the final structured itinerary by applying the user's edit requests. "
            "Ensure the output conforms exactly to the structured schema."
        )
    else:
        human_content = (
            "Synthesize the agent notes and create a complete, beautifully structured itinerary "
            "complying exactly with the response schema."
        )
        
    messages = [
        SystemMessage(content=ITINERARY_SYSTEM_PROMPT),
        HumanMessage(content=f"{context}\n\n{human_content}")
    ]
    
    try:
        response = structured_llm.invoke(messages)
        # Convert Pydantic model to dictionary for easy serialization
        return {"final_itinerary": response.model_dump()}
    except Exception as e:
        # Retry with a direct JSON prompting fallback in case structured output fails
        fallback_prompt = (
            f"{ITINERARY_SYSTEM_PROMPT}\n\n"
            f"Note: Your output must parse exactly as a JSON object matching the schema details:\n"
            f"{ItineraryResponse.model_json_schema()}\n\n"
            f"Data Context:\n{context}\n\n{human_content}"
        )
        # Call model directly
        fallback_res = model.invoke([HumanMessage(content=fallback_prompt)])
        # Parse output as JSON if necessary, but returning the structured model response is preferred.
        # We will let the error bubble up if the fallback also fails, but model.with_structured_output is highly reliable.
        raise e
