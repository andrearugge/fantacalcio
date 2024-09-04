const auctionSchema = new mongoose.Schema({
  id: String,
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Participant" }],
  bids: [
    {
      participant: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
      amount: Number,
      timestamp: Date,
    },
  ],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
  endTime: Date,
});
