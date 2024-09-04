const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    uniqueLink: {
      type: String,
      required: [true, "Unique link is required"],
      unique: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team ID is required"],
    },
    budget: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indice composto per ottimizzare le query
participantSchema.index({ name: 1, teamId: 1 }, { unique: true });

// Metodo virtuale per ottenere il link completo
participantSchema.virtual("fullLink").get(function () {
  return `${process.env.FRONTEND_URL}/auction/${this.uniqueLink}`;
});

// Metodo pre-save per assicurarsi che il nome sia in formato corretto
participantSchema.pre("save", function (next) {
  this.name =
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  next();
});

module.exports = mongoose.model("Participant", participantSchema);
