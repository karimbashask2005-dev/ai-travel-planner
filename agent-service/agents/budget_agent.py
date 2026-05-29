from agents.model import get_model
from agents.types import AgentState
from langchain_core.messages import SystemMessage, HumanMessage

BUDGET_SYSTEM_PROMPT = """You are an expert AI Travel Budget Advisor. Your job is to analyze the total budget, destination, travel style, duration, and number of travelers to generate budget planning guidelines.

Your output must detail:
1. Average suggested spending per day.
2. Suggested cost distribution percentage (e.g., Accommodation: X%, Food: Y%, Activities: Z%, Transit: W%).
3. Specific money-saving recommendations relevant to the destination (e.g., transit passes, free museum days, cheap eats, luxury splurges).
4. If this is an EDIT / REGENERATION request (e.g., "make it cheaper", "upgrade to luxury"), analyze the user instruction and provide a adjusted financial allocation matching the request.

Be realistic, numbers-driven, and highly practical.
"""

def run_budget_agent(state: AgentState) -> dict:
    """
    Executes the Budget Agent to build financial planning guidelines.
    """
    model = get_model(temperature=0.3)
    
    is_edit = state.get("edit_instruction") is not None and state.get("previous_itinerary") is not None
    
    user_context = (
        f"Destination: {state['destination']}\n"
        f"Duration: {state['days']} days\n"
        f"Total Budget: ${state['budget']}\n"
        f"Travel Style: {state['travelStyle']}\n"
        f"Travelers: {state['travelers']}\n"
    )
    
    if is_edit:
        user_context += (
            f"\n--- EDIT / REGENERATION DETAILS ---\n"
            f"User Edit Instruction: {state['edit_instruction']}\n"
            f"Previous Itinerary Overview:\n{state['previous_itinerary']}\n"
        )
        human_content = (
            f"Review the budget context and the edit instruction above. Provide budget notes "
            f"on how to re-distribute the cost or change activity plans to accommodate: '{state['edit_instruction']}'."
        )
    else:
        human_content = (
            f"Provide a cost breakdown and daily budget suggestions based on the total budget of ${state['budget']}."
        )
        
    messages = [
        SystemMessage(content=BUDGET_SYSTEM_PROMPT),
        HumanMessage(content=f"{user_context}\n\n{human_content}")
    ]
    
    response = model.invoke(messages)
    return {"budget_notes": response.content}
