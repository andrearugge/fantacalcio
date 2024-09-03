const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  budget: {
    type: Number,
    default: 500 // Puoi modificare questo valore in base alle regole del tuo fantacalcio
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);