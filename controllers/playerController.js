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
  console.log("Upload CSV request received");
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log("File uploaded:", req.file.path);

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      console.log("CSV Row:", data);  // Log each row for debugging
      const player = cleanPlayerData(data);
      if (player.name && player.role && player.team) {
        results.push(player);
      } else {
        console.log("Skipping invalid player data:", data);
      }
    })
    .on("end", async () => {
      try {
        console.log("CSV parsing completed. Valid rows:", results.length);
        await Player.deleteMany({});
        const insertedPlayers = await Player.insertMany(results, { ordered: false });
        console.log("Players inserted:", insertedPlayers.length);
        fs.unlinkSync(req.file.path);
        res.status(201).json({ message: `${insertedPlayers.length} players imported successfully` });
      } catch (error) {
        console.error("Error processing CSV:", error);
        if (error.name === "ValidationError") {
          const validationErrors = Object.values(error.errors).map(
            (err) => err.message
          );
          res.status(400).json({ message: "Validation error", errors: validationErrors });
        } else {
          res.status(500).json({ message: "Error importing players", error: error.message });
        }
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV:", error);
      res.status(500).json({ message: "Error reading CSV file" });
    });
};

function cleanPlayerData(data) {
  return {
    name: data.name ? data.name.trim() : "",
    role: data.role ? data.role.trim().toUpperCase() : "",  // Changed to uppercase to match your CSV
    team: data.team ? data.team.trim() : "",
  };
}