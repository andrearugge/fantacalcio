const Team = require("../models/Team");

exports.createTeam = async (req, res) => {
  try {
    const { name, owner } = req.body;
    const team = new Team({ name, owner });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTeams = async (req, res) => {
  console.log("Ricevuta richiesta per getAllTeams");
  try {
    const teams = await Team.find();
    console.log("Teams trovati:", teams);
    res.json(teams);
  } catch (error) {
    console.error("Errore in getAllTeams:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("players")
      .populate("owner", "name");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { name, budget } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, budget },
      { new: true, runValidators: true }
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setupTeams = async (req, res) => {
  try {
    const { teams } = req.body;
    if (!Array.isArray(teams) || teams.length !== 8) {
      return res
        .status(400)
        .json({ message: "Devi fornire esattamente 8 nomi di squadre" });
    }

    const createdTeams = await Promise.all(
      teams.map(async (teamName) => {
        const team = new Team({ name: teamName });
        return await team.save();
      })
    );

    res
      .status(201)
      .json({ message: "Squadre create con successo", teams: createdTeams });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
