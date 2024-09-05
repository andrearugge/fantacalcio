const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    bids: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
        amount: Number,
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    winner: {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      amount: Number,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
