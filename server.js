const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

console.log('Starting server...');

// Importa le rotte
const participantRoutes = require("./routes/participantRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

// Configurazione CORS
console.log('Configuring CORS...');
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "https://fantacalcio-fe.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

// Usa le rotte
console.log('Setting up routes...');
app.use("/api/participants", participantRoutes);
app.use("/api/teams", teamRoutes);

console.log('Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
console.log('Starting to listen on port...');
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

console.log('Server setup complete.');