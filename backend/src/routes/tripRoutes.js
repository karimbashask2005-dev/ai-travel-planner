const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const protect = require('../middleware/authMiddleware');

// Apply protection middleware to all trip endpoints
router.use(protect);

router.post('/generate', tripController.generateTrip);
router.post('/:id/regenerate', tripController.regenerateTrip);
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
