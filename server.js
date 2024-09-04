const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

console.log("Starting server...");

// Importa le rotte
const participantRoutes = require("./routes/participantRoutes");
const teamRoutes = require("./routes/teamRoutes");
const playerRoutes = require("./routes/playerRoutes");

const app = express();
const server = http.createServer(app);

// Configurazione CORS
console.log("Configuring CORS...");
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "https://fantacalcio-fe.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Configurazione Socket.IO
const io = socketIo(server, {
  cors: corsOptions,
});

// Configurazione dell'auction socket
const setupAuctionSocket = require("./auctionController");
setupAuctionSocket(io);

app.use(cors(corsOptions));
app.use(express.json());

console.log("Connecting to MongoDB...");
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in the environment variables");
  process.exit(1);
}

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

// Usa le rotte
console.log("Setting up routes...");
app.use("/api/participants", participantRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);

// Logging delle route definite
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
console.log("Starting to listen on port...");
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("Server setup complete.");

// Esporta app e io per poterli utilizzare in altri file
module.exports = { app, io };
