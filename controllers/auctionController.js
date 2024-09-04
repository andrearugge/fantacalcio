const Auction = require("../models/Auction");
const Player = require("../models/Player");
const Participant = require("../models/Participant");

exports.startAuction = async (req, res) => {
  try {
    const { auctionId, playerId } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    if (auction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Auction is already in progress or completed" });
    }

    auction.status = "active";
    auction.currentPlayer = playerId;
    auction.endTime = new Date(Date.now() + 20000); // 20 seconds from now
    await auction.save();

    req.app.get("io").to(auctionId).emit("auctionStarted", { auction });
    res.json({ message: "Auction started", auction });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error starting auction", error: error.message });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { auctionId, participantId, amount } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (new Date() > auction.endTime) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    if (amount > participant.budget) {
      return res
        .status(400)
        .json({ message: "Bid amount exceeds participant's budget" });
    }

    auction.bids.push({
      participant: participantId,
      amount,
      timestamp: new Date(),
    });
    await auction.save();

    req.app.get("io").to(auctionId).emit("newBid", { auction });
    res.json({ message: "Bid placed", auction });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing bid", error: error.message });
  }
};

exports.endAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId).populate(
      "bids.participant"
    );
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (auction.bids.length === 0) {
      auction.status = "completed";
      await auction.save();
      req.app.get("io").to(auctionId).emit("auctionEnded", { auction });
      return res.json({ message: "Auction ended with no bids", auction });
    }

    const winningBid = auction.bids.reduce((prev, current) =>
      prev.amount > current.amount ? prev : current
    );

    auction.winner = winningBid.participant;
    auction.status = "completed";
    await auction.save();

    // Update winner's budget
    const winner = await Participant.findById(auction.winner._id);
    winner.budget -= winningBid.amount;
    await winner.save();

    req.app.get("io").to(auctionId).emit("auctionEnded", { auction });
    res.json({ message: "Auction ended", winner: auction.winner });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error ending auction", error: error.message });
  }
};
