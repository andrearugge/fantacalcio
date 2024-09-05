const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["portiere", "difensore", "centrocampista", "attaccante", "P", "D", "C", "A"],
  },
  team: { type: String, required: true },
  currentAuction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);