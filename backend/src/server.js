const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-travel-planner';

// Configure Mongoose options
mongoose.set('strictQuery', false);

// Establish database connection and start Express server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Database.');
    app.listen(PORT, () => {
      console.log(`Backend Server listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failure:', error.message);
    process.exit(1);
  });
