const Player = require("./models/Player");
const { v4: uuidv4 } = require("uuid");

const auctions = new Map();
const participantLinks = new Map();

function generateParticipantLink(participantId) {
  const linkId = uuidv4();
  participantLinks.set(linkId, participantId);
  return `/auction-participant/${linkId}`;
}

function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("startAuction", async (playerId) => {
      try {
        const player = await Player.findById(playerId);
        if (!player) {
          throw new Error("Player not found");
        }

        if (
          Array.from(auctions.values()).some(
            (a) => a.player._id.toString() === player._id.toString()
          )
        ) {
          throw new Error("This player is already in an auction");
        }

        const auctionId = uuidv4();
        const auction = {
          id: auctionId,
          player: player,
          currentBid: 0,
          currentBidder: null,
          timeLeft: 20,
          participants: new Set(),
        };

        auctions.set(auctionId, auction);

        await Player.findByIdAndUpdate(playerId, {
          auctionStatus: "inAuction",
        });

        io.emit("auctionStarted", {
          auctionId,
          player,
          timeLeft: auction.timeLeft,
          currentBid: auction.currentBid,
        });

        startAuctionTimer(io, auctionId);
      } catch (error) {
        console.error("Error starting auction:", error);
        socket.emit("auctionError", error.message);
      }
    });

    socket.on("joinAuction", (auctionId) => {
      const auction = auctions.get(auctionId);
      if (auction) {
        socket.join(auctionId);
        auction.participants.add(socket.id);
        socket.emit("auctionInfo", {
          player: auction.player,
          currentBid: auction.currentBid,
          timeLeft: auction.timeLeft,
          currentBidder: auction.currentBidder,
        });
      } else {
        socket.emit("auctionError", "Auction not found");
      }
    });

    socket.on("placeBid", ({ auctionId, amount, userId }) => {
      const auction = auctions.get(auctionId);
      if (auction && amount > auction.currentBid) {
        auction.currentBid = amount;
        auction.currentBidder = userId;
        auction.timeLeft = 20; // Reset timer on new bid
        io.to(auctionId).emit("bidUpdated", { amount, bidder: userId });
      } else {
        socket.emit("bidError", "Invalid bid");
      }
    });

    socket.on("getAuctionStatus", (auctionId) => {
      const auction = auctions.get(auctionId);
      if (auction) {
        socket.emit("auctionStatus", {
          player: auction.player,
          currentBid: auction.currentBid,
          timeLeft: auction.timeLeft,
          currentBidder: auction.currentBidder,
        });
      } else {
        socket.emit("auctionError", "Auction not found");
      }
    });

    socket.on("createParticipantLink", (participantId) => {
      const link = generateParticipantLink(participantId);
      socket.emit("participantLinkCreated", { participantId, link });
    });

    socket.on("getParticipantLinks", () => {
      const links = Array.from(participantLinks).map(
        ([linkId, participantId]) => ({
          linkId,
          participantId,
          url: `/auction-participant/${linkId}`,
        })
      );
      socket.emit("participantLinks", links);
    });

    socket.on("joinAsParticipant", (linkId) => {
      const participantId = participantLinks.get(linkId);
      if (participantId) {
        socket.participantId = participantId;
        socket.emit("joinedAsParticipant", { participantId });
      } else {
        socket.emit("auctionError", "Invalid participant link");
      }
    });

    socket.on("notifyParticipant", ({ linkId, auctionId }) => {
      const participantId = participantLinks.get(linkId);
      if (participantId) {
        io.to(participantId).emit("auctionStarted", { auctionId });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      auctions.forEach((auction) => {
        auction.participants.delete(socket.id);
      });
    });
  });
}

function startAuctionTimer(io, auctionId) {
  const auction = auctions.get(auctionId);
  if (!auction) return;

  const timer = setInterval(() => {
    auction.timeLeft--;
    io.to(auctionId).emit("timerUpdate", auction.timeLeft);

    if (auction.timeLeft <= 0) {
      clearInterval(timer);
      endAuction(io, auctionId);
    }
  }, 1000);
}

async function endAuction(io, auctionId) {
  const auction = auctions.get(auctionId);
  if (!auction) return;

  try {
    await Player.findByIdAndUpdate(auction.player._id, {
      auctionStatus: "sold",
      soldTo: auction.currentBidder,
      soldFor: auction.currentBid,
      soldAt: new Date(),
    });

    io.to(auctionId).emit("auctionEnded", {
      player: auction.player,
      winner: auction.currentBidder,
      amount: auction.currentBid,
    });

    auctions.delete(auctionId);
  } catch (error) {
    console.error("Error ending auction:", error);
    io.to(auctionId).emit("auctionError", "Error ending auction");
  }
}

module.exports = setupSocketIO;
