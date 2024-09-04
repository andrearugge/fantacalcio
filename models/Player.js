const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "portiere",
        "difensore",
        "centrocampista",
        "attaccante",
        "P",
        "D",
        "C",
        "A",
      ],
    },
    team: { type: String, required: true },
    // Campi relativi all'asta
    auctionStatus: {
      type: String,
      enum: ["available", "inAuction", "sold"],
      default: "available",
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },
    soldFor: {
      type: Number,
      default: 0,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Player", playerSchema);
