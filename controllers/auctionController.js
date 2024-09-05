const Auction = require("../models/Auction");
const Player = require("../models/Player");
const Team = require("../models/Team");

exports.startAuction = async (req, res) => {
  try {
    const { playerId } = req.body;
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Giocatore non trovato" });
    }

    const auction = new Auction({
      player: playerId,
      endTime: new Date(Date.now() + 20000), // 20 secondi
    });

    await auction.save();
    player.currentAuction = auction._id;
    await player.save();

    // Emetti un evento socket per notificare i client dell'inizio dell'asta
    req.app
      .get("io")
      .emit("auctionStarted", { auctionId: auction._id, player: player });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { auctionId, teamId, amount } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Asta non trovata" });
    }

    if (auction.status === "completed") {
      return res.status(400).json({ message: "L'asta è già terminata" });
    }

    if (amount < 1 || amount > 300) {
      return res
        .status(400)
        .json({ message: "L'offerta deve essere compresa tra 1 e 300" });
    }

    auction.bids.push({ team: teamId, amount });
    await auction.save();

    // Emetti un evento socket per notificare i client della nuova offerta
    req.app
      .get("io")
      .emit("newBid", { auctionId: auction._id, teamId, amount });

    res.status(200).json({ message: "Offerta piazzata con successo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: "ongoing" }).populate(
      "player"
    );
    if (!auction) {
      return res.status(404).json({ message: "Nessuna asta in corso" });
    }
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuctionResult = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("player")
      .populate("winner.team");
    if (!auction) {
      return res.status(404).json({ message: "Asta non trovata" });
    }
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
