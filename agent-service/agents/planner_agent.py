from agents.model import get_model
from agents.types import AgentState
from langchain_core.messages import SystemMessage, HumanMessage

PLANNER_SYSTEM_PROMPT = """You are an expert AI Travel Planner. Your task is to analyze the user's travel request and generate high-level planning notes that set the strategic direction for the trip.

You must outline:
1. Core theme/focus of the trip based on travel style and interests.
2. Logistics, neighborhood recommendations, and transit suggestions for the destination.
3. Recommended daily pace and breakdown (e.g., morning and afternoon zones to visit).
4. If this is an EDIT / REGENERATION request, write a clear modification plan mapping the user's instructions against the previous itinerary. Explain exactly what should be swapped, removed, or added.

Be concise, practical, and destination-specific. Do not use generic placeholders.
"""

def run_planner_agent(state: AgentState) -> dict:
    """
    Executes the Planner Agent to build high-level planning notes.
    """
    model = get_model(temperature=0.4)
    
    # Structure the prompt based on whether it is an initial plan or a regeneration plan
    is_edit = state.get("edit_instruction") is not None and state.get("previous_itinerary") is not None
    
    user_context = (
        f"Destination: {state['destination']}\n"
        f"Duration: {state['days']} days\n"
        f"Budget: ${state['budget']} total\n"
        f"Travel Style: {state['travelStyle']}\n"
        f"Interests: {', '.join(state['interests'])}\n"
        f"Travelers: {state['travelers']}\n"
    )
    
    if is_edit:
        user_context += (
            f"\n--- EDIT / REGENERATION DETAILS ---\n"
            f"User Edit Instruction: {state['edit_instruction']}\n"
            f"Previous Itinerary Overview:\n{state['previous_itinerary']}\n"
        )
        human_content = (
            f"Review the travel details and the edit instruction above. Provide detailed planning notes "
            f"and a modification strategy to adapt the previous itinerary to meet the new requirement: '{state['edit_instruction']}'."
        )
    else:
        human_content = (
            f"Analyze the travel details and create a comprehensive high-level plan for this trip. "
            f"Provide strategic recommendations matching the style '{state['travelStyle']}' and interests '{state['interests']}'."
        )
        
    messages = [
        SystemMessage(content=PLANNER_SYSTEM_PROMPT),
        HumanMessage(content=f"{user_context}\n\n{human_content}")
    ]
    
    response = model.invoke(messages)
    return {"planner_notes": response.content}
