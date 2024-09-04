const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

console.log("Starting server...");

// Importa le rotte e i modelli
const participantRoutes = require("./routes/participantRoutes");
const teamRoutes = require("./routes/teamRoutes");
const playerRoutes = require("./routes/playerRoutes");
const Player = require("./models/Player");
const auctionRoutes = require("./routes/auctionRoutes");
const Auction = require("./models/Auction");

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

app.use(cors(corsOptions));
app.use(express.json());

// Rendi io accessibile in tutta l'app
app.set("io", io);

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
app.use("/api/auctions", auctionRoutes);

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinAuction", ({ participantId }) => {
    socket.join(participantId);
    console.log(`Participant joined auction: ${participantId}`);
  });

  socket.on("startAuction", async ({ playerId }) => {
    try {
      const player = await Player.findById(playerId);
      if (player) {
        const auction = new Auction({
          player: playerId,
          startTime: new Date(),
          duration: 60,
          status: "active",
        });
        await auction.save();
        io.emit("auctionStarted", { player, duration: 60 });
        console.log(`Auction started for player: ${player.name}`);

        // Set a timeout to end the auction after 60 seconds
        setTimeout(async () => {
          await endAuction(auction._id);
        }, 60000);
      }
    } catch (error) {
      console.error("Error starting auction:", error);
    }
  });

  socket.on("placeBid", async ({ participantId, amount }) => {
    try {
      const currentAuction = await Auction.findOne({ status: "active" });
      if (currentAuction) {
        currentAuction.bids.push({ participant: participantId, amount });
        await currentAuction.save();
        io.emit("newBid", { participantId, amount });
        console.log(`New bid placed: ${amount} by ${participantId}`);
      }
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to end the auction
async function endAuction(auctionId) {
  try {
    const auction = await Auction.findById(auctionId).populate(
      "bids.participant"
    );
    if (auction && auction.status === "active") {
      auction.status = "completed";
      if (auction.bids.length > 0) {
        const winningBid = auction.bids.reduce((prev, current) =>
          prev.amount > current.amount ? prev : current
        );
        auction.winner = winningBid.participant;
      }
      await auction.save();
      io.emit("auctionEnded", { auction });
      console.log(
        `Auction ended. Winner: ${
          auction.winner ? auction.winner.name : "No winner"
        }`
      );
    }
  } catch (error) {
    console.error("Error ending auction:", error);
  }
}

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
