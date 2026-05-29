import httpx
import logging
from agents.model import get_model
from agents.types import AgentState
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

WEATHER_SYSTEM_PROMPT = """You are an expert travel weather agent. Your job is to analyze the local weather data for the destination and create practical, day-by-day, weather-aware advice for the trip.

Given the weather report (live forecast or general seasonal averages if offline) and the number of days, you must:
1. Provide a short weather summary for the destination.
2. Outline a list of day-by-day practical tips (e.g. Day 1: Perfect sunny day, high of 24°C, ideal for outdoor hiking. Day 2: Rain expected, keep an umbrella handy and plan indoor activities).
3. If the trip has more days than the weather forecast covers, continue with standard seasonal recommendations for the remaining days.

Keep it short, practical, tourist-focused, and action-oriented.
"""

def wmo_weather_code_to_text(code: int) -> str:
    """Translates WMO weather code to simple human text."""
    codes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with light hail",
        99: "Thunderstorm with heavy hail"
    }
    return codes.get(code, "Variable weather")

def fetch_live_weather(destination: str) -> dict:
    """
    Geocodes destination and fetches 7-day weather forecast from Open-Meteo API.
    Does not require API keys.
    """
    try:
        # Step 1: Geocoding
        geocode_url = f"https://geocoding-api.open-meteo.com/v1/search?name={destination}&count=1&language=en&format=json"
        geo_response = httpx.get(geocode_url, timeout=10.0)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        results = geo_data.get("results")
        if not results:
            logger.warning(f"Could not geocode destination: {destination}")
            return None
            
        location = results[0]
        lat = location["latitude"]
        lon = location["longitude"]
        name = location.get("name", destination)
        country = location.get("country", "")
        
        # Step 2: Fetch Forecast
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode"
            f"&timezone=auto"
        )
        weather_response = httpx.get(weather_url, timeout=10.0)
        weather_response.raise_for_status()
        weather_data = weather_response.json()
        
        daily = weather_data.get("daily", {})
        
        # Format weather description for prompt
        forecast_list = []
        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precip_probs = daily.get("precipitation_probability_max", [])
        w_codes = daily.get("weathercode", [])
        
        for i in range(len(dates)):
            date = dates[i]
            max_t = max_temps[i] if i < len(max_temps) else "N/A"
            min_t = min_temps[i] if i < len(min_temps) else "N/A"
            prob = precip_probs[i] if i < len(precip_probs) else "N/A"
            cond = wmo_weather_code_to_text(w_codes[i]) if i < len(w_codes) else "Unknown"
            forecast_list.append(
                f"Date: {date} | Temp: {min_t}°C to {max_t}°C | Rain Prob: {prob}% | Conditions: {cond}"
            )
            
        return {
            "location_name": f"{name}, {country}",
            "coordinates": f"Lat: {lat}, Lon: {lon}",
            "forecast": "\n".join(forecast_list)
        }
        
    except Exception as e:
        logger.error(f"Weather API fetch failed for {destination}: {str(e)}")
        return None

def run_weather_agent(state: AgentState) -> dict:
    """
    Executes the Weather Agent, integrating real weather data into the LLM context.
    """
    destination = state["destination"]
    weather_info = fetch_live_weather(destination)
    
    model = get_model(temperature=0.3)
    
    if weather_info:
        weather_context = (
            f"Real weather data fetched for {weather_info['location_name']} ({weather_info['coordinates']}):\n"
            f"{weather_info['forecast']}\n"
        )
    else:
        weather_context = (
            f"Could not fetch real-time weather details for '{destination}'.\n"
            f"Please fallback to historical climatology and typical weather conditions for this destination "
            f"appropriate for the duration of {state['days']} days."
        )
        
    user_prompt = (
        f"Trip Destination: {destination}\n"
        f"Trip Duration: {state['days']} days\n"
        f"Travel Style: {state['travelStyle']}\n"
        f"Interests: {', '.join(state['interests'])}\n\n"
        f"{weather_context}\n"
        f"Generate practical day-by-day weather advice for the traveler."
    )
    
    messages = [
        SystemMessage(content=WEATHER_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]
    
    response = model.invoke(messages)
    return {"weather_notes": response.content}
