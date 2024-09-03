// controllers/playerController.js
const Player = require("../models/Player");
const csv = require("csv-parser");
const fs = require("fs");

exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPlayer = async (req, res) => {
  const player = new Player(req.body);
  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        await Player.deleteMany({}); // Opzionale: elimina tutti i giocatori esistenti
        const players = await Player.insertMany(results);
        fs.unlinkSync(req.file.path); // Elimina il file temporaneo
        res
          .status(201)
          .json({ message: `${players.length} players imported successfully` });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
};
