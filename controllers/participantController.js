const Participant = require("../models/Participant");
const { v4: uuidv4 } = require("uuid");

exports.createParticipant = async (req, res) => {
  try {
    const { name, teamId } = req.body;
    const uniqueLink = uuidv4();
    const participant = new Participant({ name, uniqueLink, teamId });
    await participant.save();
    res.status(201).json({
      message: "Participant created successfully",
      participantLink: `${process.env.FRONTEND_URL}/auction/${uniqueLink}`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getParticipantByLink = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const participant = await Participant.findOne({ uniqueLink });
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }
    res.json(participant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({}, "name _id");
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
