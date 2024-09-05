// auctionController.js
const Auction = require("../models/Auction");
const Player = require("../models/Player");
const { endActiveAuctions } = require("./auctionHelpers");

exports.startAuction = async (req, res) => {
  console.time("startAuction");
  console.log("Richiesta di avvio asta ricevuta:", req.body);
  try {
    console.log("Iniziando la terminazione delle aste attive...");
    console.time("endActiveAuctions");
    await endActiveAuctions();
    console.timeEnd("endActiveAuctions");
    console.log("Terminazione delle aste attive completata");

    const { playerId } = req.body;
    if (!playerId) {
      console.log("PlayerId mancante nella richiesta");
      return res.status(400).json({ message: "PlayerId è richiesto" });
    }

    console.log("Cercando il giocatore con ID:", playerId);
    console.time("findPlayer");
    const player = await Player.findById(playerId);
    console.timeEnd("findPlayer");
    if (!player) {
      console.log("Giocatore non trovato per l'ID:", playerId);
      return res.status(404).json({ message: "Giocatore non trovato" });
    }
    console.log("Giocatore trovato:", player);

    console.log("Creando una nuova asta...");
    const auction = new Auction({
      player: playerId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 20000), // 20 secondi
      status: "ongoing",
    });

    console.log("Salvando la nuova asta...");
    console.time("saveAuction");
    await auction.save();
    console.timeEnd("saveAuction");
    console.log("Nuova asta salvata:", auction);

    console.log("Aggiornando il giocatore con l'ID dell'asta...");
    console.time("updatePlayer");
    player.currentAuction = auction._id;
    await player.save();
    console.timeEnd("updatePlayer");
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
  } finally {
    console.timeEnd("startAuction");
  }
};
