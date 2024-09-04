// models/Auction.js
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
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 60, // durata in secondi
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    bids: [
      {
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Participant",
        },
        amount: {
          type: Number,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },
    winningBid: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Metodo pre-save per impostare endTime
auctionSchema.pre("save", function (next) {
  if (
    this.isNew ||
    this.isModified("startTime") ||
    this.isModified("duration")
  ) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 1000);
  }
  next();
});

// Metodo virtuale per verificare se l'asta è attualmente in corso
auctionSchema.virtual("isActive").get(function () {
  const now = new Date();
  return this.startTime <= now && now <= this.endTime;
});

// Metodo per aggiungere un'offerta
auctionSchema.methods.placeBid = function (participantId, amount) {
  if (this.isActive) {
    this.bids.push({ participant: participantId, amount });
    if (amount > (this.winningBid || 0)) {
      this.winningBid = amount;
      this.winner = participantId;
    }
    return true;
  }
  return false;
};

// Metodo per concludere l'asta
auctionSchema.methods.conclude = function () {
  if (this.status !== "completed") {
    this.status = "completed";
    this.endTime = new Date();
    // Qui puoi aggiungere logica aggiuntiva se necessario
  }
};

module.exports = mongoose.model("Auction", auctionSchema);
