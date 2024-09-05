const Auction = require("../models/Auction");
const Player = require("../models/Player");
const Team = require("../models/Team");

exports.startAuction = async (req, res) => {
  console.log("Richiesta di avvio asta ricevuta:", req.body);
  try {
    const { playerId } = req.body;
    if (!playerId) {
      console.log("PlayerId mancante nella richiesta");
      return res.status(400).json({ message: "PlayerId è richiesto" });
    }

    console.log("Cercando il giocatore con ID:", playerId);
    const player = await Player.findById(playerId);
    if (!player) {
      console.log("Giocatore non trovato per l'ID:", playerId);
      return res.status(404).json({ message: "Giocatore non trovato" });
    }
    console.log("Giocatore trovato:", player);

    console.log("Verificando se c'è un'asta in corso...");
    const ongoingAuction = await Auction.findOne({ status: "ongoing" });
    if (ongoingAuction) {
      console.log("Asta in corso trovata:", ongoingAuction);
      return res.status(400).json({ message: "C'è già un'asta in corso" });
    }

    console.log("Creando una nuova asta...");
    const auction = new Auction({
      player: playerId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 20000), // 20 secondi
      status: "ongoing",
    });

    console.log("Salvando la nuova asta...");
    await auction.save();
    console.log("Nuova asta salvata:", auction);

    console.log("Aggiornando il giocatore con l'ID dell'asta...");
    player.currentAuction = auction._id;
    await player.save();
    console.log("Giocatore aggiornato");

    console.log("Emettendo l'evento socket per l'inizio dell'asta...");
    const io = req.app.get("io");
    if (io) {
      io.emit("auctionStarted", {
        auctionId: auction._id,
        player: {
          _id: player._id,
          name: player.name,
          role: player.role,
          team: player.team,
        },
        endTime: auction.endTime,
      });
      console.log("Evento socket emesso");
    } else {
      console.log("Oggetto io non trovato");
    }

    console.log("Inviando la risposta al client...");
    res.status(201).json(auction);
  } catch (error) {
    console.error("Errore nell'avvio dell'asta:", error);
    res
      .status(500)
      .json({ message: "Errore del server", error: error.message });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { auctionId, teamId, amount } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Asta non trovata" });
    }

    if (auction.status !== "ongoing") {
      return res.status(400).json({ message: "L'asta non è in corso" });
    }

    if (amount < 1 || amount > 300) {
      return res
        .status(400)
        .json({ message: "L'offerta deve essere compresa tra 1 e 300" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Squadra non trovata" });
    }

    if (team.budget < amount) {
      return res.status(400).json({ message: "Budget insufficiente" });
    }

    auction.bids.push({ team: teamId, amount });
    await auction.save();

    // Emetti un evento socket per notificare i client della nuova offerta
    req.app
      .get("io")
      .emit("newBid", { auctionId: auction._id, teamId, amount });

    res.status(200).json({ message: "Offerta piazzata con successo" });
  } catch (error) {
    console.error("Errore nel piazzare l'offerta:", error);
    res.status(500).json({ message: "Errore del server" });
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
    console.error("Errore nel recupero dell'asta corrente:", error);
    res.status(500).json({ message: "Errore del server" });
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
    console.error("Errore nel recupero del risultato dell'asta:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

exports.endAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "ongoing") {
      console.log("Nessuna asta attiva da terminare");
      return;
    }

    auction.status = "completed";
    if (auction.bids.length > 0) {
      const winningBid = auction.bids.reduce((prev, current) =>
        prev.amount > current.amount ? prev : current
      );
      auction.winner = { team: winningBid.team, amount: winningBid.amount };

      const winningTeam = await Team.findById(winningBid.team);
      winningTeam.budget -= winningBid.amount;
      await winningTeam.save();

      const player = await Player.findById(auction.player);
      player.owner = winningBid.team;
      player.currentAuction = null;
      await player.save();
    }

    await auction.save();

    // Notifica tutti i client che l'asta è terminata
    global.io.emit("auctionEnded", {
      auctionId: auction._id,
      winner: auction.winner,
      player: auction.player,
    });
  } catch (error) {
    console.error("Errore nella conclusione dell'asta:", error);
  }
};
