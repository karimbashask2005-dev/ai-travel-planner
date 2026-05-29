const axios = require('axios');

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Sends travel request parameters to the agent service to generate a day-wise plan.
 */
exports.generateItinerary = async (tripParams) => {
  try {
    const response = await axios.post(`${AGENT_SERVICE_URL}/generate-itinerary`, {
      destination: tripParams.destination,
      days: Number(tripParams.days),
      budget: Number(tripParams.budget),
      travelStyle: tripParams.travelStyle,
      interests: tripParams.interests || [],
      travelers: Number(tripParams.travelers || 1)
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message;
    throw new Error(`Agent-Service Generation Error: ${errorMsg}`);
  }
};

/**
 * Sends a revision request with edit instructions and the previous itinerary details.
 */
exports.editItinerary = async (editParams) => {
  try {
    const response = await axios.post(`${AGENT_SERVICE_URL}/edit-itinerary`, {
      destination: editParams.destination,
      days: Number(editParams.days),
      budget: Number(editParams.budget),
      travelStyle: editParams.travelStyle,
      interests: editParams.interests || [],
      travelers: Number(editParams.travelers || 1),
      editInstruction: editParams.editInstruction,
      previousItinerary: editParams.previousItinerary
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message;
    throw new Error(`Agent-Service Revision Error: ${errorMsg}`);
  }
};
