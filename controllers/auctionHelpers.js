const Auction = require("../models/Auction");
const Player = require("../models/Player");

async function endActiveAuctions() {
  console.log("Iniziando la terminazione delle aste attive...");

  try {
    // Trova tutte le aste attive
    const activeAuctions = await Auction.find({ status: "ongoing" });
    console.log(`Trovate ${activeAuctions.length} aste attive`);

    for (const auction of activeAuctions) {
      console.log(`Terminando l'asta con ID: ${auction._id}`);

      // Aggiorna lo stato dell'asta
      auction.status = "completed";
      auction.endTime = new Date(); // Imposta il tempo di fine all'ora corrente

      // Se ci sono offerte, determina il vincitore
      if (auction.bids.length > 0) {
        const winningBid = auction.bids.reduce((prev, current) =>
          prev.amount > current.amount ? prev : current
        );
        auction.winner = { team: winningBid.team, amount: winningBid.amount };
        console.log(
          `Vincitore dell'asta: Team ${winningBid.team} con un'offerta di ${winningBid.amount}`
        );
      } else {
        console.log("Nessuna offerta per questa asta");
      }

      // Salva l'asta aggiornata
      await auction.save();

      // Aggiorna il giocatore associato
      const player = await Player.findById(auction.player);
      if (player) {
        player.currentAuction = null;
        if (auction.winner) {
          player.owner = auction.winner.team;
          player.price = auction.winner.amount;
        }
        await player.save();
        console.log(`Giocatore ${player.name} aggiornato`);
      } else {
        console.log(`Giocatore non trovato per l'asta ${auction._id}`);
      }
    }

    console.log("Terminazione delle aste attive completata");
  } catch (error) {
    console.error("Errore durante la terminazione delle aste attive:", error);
    throw error; // Rilancia l'errore per gestirlo nella funzione chiamante
  }
}

// Esporta la funzione se vuoi usarla in altri file
module.exports = { endActiveAuctions };
