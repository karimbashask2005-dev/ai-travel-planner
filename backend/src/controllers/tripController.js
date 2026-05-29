const Trip = require('../models/Trip');
const agentService = require('../services/agentService');

/**
 * Handles initial trip generation and DB record creation.
 */
exports.generateTrip = async (req, res) => {
  try {
    const { destination, days, budget, travelStyle, interests, travelers } = req.body;

    if (!destination || !days || !budget || !travelStyle) {
      return res.status(400).json({ error: 'Missing required parameters (destination, days, budget, travelStyle).' });
    }

    // Call Python agent service
    const agentItinerary = await agentService.generateItinerary({
      destination,
      days,
      budget,
      travelStyle,
      interests,
      travelers
    });

    // Save generated trip to MongoDB
    const savedTrip = await Trip.create({
      user: req.user.id,
      tripTitle: agentItinerary.tripTitle,
      summary: agentItinerary.summary,
      destination: agentItinerary.destination,
      days: agentItinerary.days,
      budget: agentItinerary.budget,
      travelStyle: agentItinerary.travelStyle,
      travelers: travelers || 1,
      interests: interests || [],
      itinerary: agentItinerary.itinerary
    });

    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error generating trip' });
  }
};

/**
 * Retrieves all trips saved by the currently logged-in user.
 */
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching trips' });
  }
};

/**
 * Retrieves a single trip if it belongs to the logged-in user.
 */
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized access' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching trip details' });
  }
};

/**
 * Deletes a trip if it belongs to the logged-in user.
 */
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized access' });
    }
    res.status(200).json({ message: 'Trip successfully deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error deleting trip' });
  }
};

/**
 * Handles modifying and regenerating an existing itinerary.
 */
exports.regenerateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { editInstruction } = req.body;

    if (!editInstruction) {
      return res.status(400).json({ error: 'Edit instruction prompt is required.' });
    }

    // Find previous trip
    const trip = await Trip.findOne({ _id: id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized access' });
    }

    // Call Python agent service with edit commands
    const revisedItinerary = await agentService.editItinerary({
      destination: trip.destination,
      days: trip.days,
      budget: trip.budget,
      travelStyle: trip.travelStyle,
      interests: trip.interests,
      travelers: trip.travelers,
      editInstruction,
      previousItinerary: {
        tripTitle: trip.tripTitle,
        summary: trip.summary,
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget,
        travelStyle: trip.travelStyle,
        itinerary: trip.itinerary.map(item => ({
          day: item.day,
          title: item.title,
          activities: item.activities,
          estimatedCost: item.estimatedCost
        }))
      }
    });

    // Update MongoDB trip details
    trip.tripTitle = revisedItinerary.tripTitle;
    trip.summary = revisedItinerary.summary;
    trip.itinerary = revisedItinerary.itinerary;
    trip.budget = revisedItinerary.budget; // In case budget was updated
    trip.travelStyle = revisedItinerary.travelStyle; // In case style was updated

    await trip.save();
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error regenerating trip' });
  }
};
