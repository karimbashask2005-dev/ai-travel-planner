const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  activities: {
    type: [String],
    default: []
  },
  estimatedCost: {
    type: Number,
    required: true
  }
});

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripTitle: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  travelStyle: {
    type: String,
    required: true
  },
  travelers: {
    type: Number,
    default: 1
  },
  interests: {
    type: [String],
    default: []
  },
  itinerary: [DaySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', TripSchema);
