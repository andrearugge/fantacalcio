const Participant = require("../models/Participant");
const { v4: uuidv4 } = require("uuid");

exports.createParticipant = async (req, res) => {
  try {
    const { name, teamId } = req.body;
    const uniqueLink = uuidv4();

    // Verifica se il partecipante esiste già
    const existingParticipant = await Participant.findOne({ name });
    if (existingParticipant) {
      return res
        .status(400)
        .json({ message: "Participant with this name already exists" });
    }

    const participant = new Participant({ name, uniqueLink, teamId });
    await participant.save();

    res.status(201).json({
      message: "Participant created successfully",
      participant: {
        id: participant._id,
        name: participant.name,
        teamId: participant.teamId,
      },
      participantLink: `${process.env.FRONTEND_URL}/auction/${uniqueLink}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating participant", error: error.message });
  }
};

exports.getParticipantByLink = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const participant = await Participant.findOne({ uniqueLink }).select(
      "-uniqueLink"
    );

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.json(participant);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving participant", error: error.message });
  }
};

exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({}, "name _id teamId");
    res.json(participants);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving participants", error: error.message });
  }
};

// Nuovo metodo per aggiornare un partecipante
exports.updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teamId } = req.body;

    const updatedParticipant = await Participant.findByIdAndUpdate(
      id,
      { name, teamId },
      { new: true, runValidators: true }
    ).select("-uniqueLink");

    if (!updatedParticipant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.json({
      message: "Participant updated successfully",
      participant: updatedParticipant,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating participant", error: error.message });
  }
};

// Nuovo metodo per eliminare un partecipante
exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedParticipant = await Participant.findByIdAndDelete(id);

    if (!deletedParticipant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.json({ message: "Participant deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting participant", error: error.message });
  }
};
