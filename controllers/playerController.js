// controllers/playerController.js
const Player = require('../models/Player');
const csv = require('csv-parser');
const fs = require('fs');

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
  console.log('Upload CSV request received');
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log('File uploaded:', req.file.path);

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log('CSV parsing completed. Rows:', results.length);
        await Player.deleteMany({}); // Opzionale: elimina tutti i giocatori esistenti
        const players = await Player.insertMany(results);
        console.log('Players inserted:', players.length);
        fs.unlinkSync(req.file.path); // Elimina il file temporaneo
        res.status(201).json({ message: `${players.length} players imported successfully` });
      } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(500).json({ message: error.message });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
};
