from langgraph.graph import StateGraph, END
from agents.types import AgentState
from agents.planner_agent import run_planner_agent
from agents.weather_agent import run_weather_agent
from agents.budget_agent import run_budget_agent
from agents.itinerary_agent import run_itinerary_agent

def create_workflow():
    """
    Creates and compiles the LangGraph StateGraph workflow for itinerary planning.
    Flow: Start -> Planner -> Weather -> Budget -> Itinerary -> End
    """
    # Initialize the graph with the AgentState type
    workflow = StateGraph(AgentState)
    
    # Register the nodes
    workflow.add_node("planner", run_planner_agent)
    workflow.add_node("weather", run_weather_agent)
    workflow.add_node("budget", run_budget_agent)
    workflow.add_node("itinerary", run_itinerary_agent)
    
    # Establish edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "weather")
    workflow.add_edge("weather", "budget")
    workflow.add_edge("budget", "itinerary")
    workflow.add_edge("itinerary", END)
    
    # Compile the graph
    app = workflow.compile()
    return app

# Expose compiled app instance
itinerary_workflow = create_workflow()
