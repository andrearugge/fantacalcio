// auctionHelpers.js
const Auction = require("../models/Auction");
const Player = require("../models/Player");

async function endActiveAuctions() {
  console.log("Iniziando la terminazione delle aste attive...");
  console.time("endActiveAuctions");

  try {
    console.time("findActiveAuctions");
    const activeAuctions = await Auction.find({ status: "ongoing" });
    console.timeEnd("findActiveAuctions");
    console.log(`Trovate ${activeAuctions.length} aste attive`);

    for (const auction of activeAuctions) {
      console.log(`Terminando l'asta con ID: ${auction._id}`);

      auction.status = "completed";
      auction.endTime = new Date();

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

      console.time(`saveAuction_${auction._id}`);
      await auction.save();
      console.timeEnd(`saveAuction_${auction._id}`);

      console.time(`findPlayer_${auction.player}`);
      const player = await Player.findById(auction.player);
      console.timeEnd(`findPlayer_${auction.player}`);
      if (player) {
        player.currentAuction = null;
        if (auction.winner) {
          player.owner = auction.winner.team;
          player.price = auction.winner.amount;
        }
        console.time(`savePlayer_${player._id}`);
        await player.save();
        console.timeEnd(`savePlayer_${player._id}`);
        console.log(`Giocatore ${player.name} aggiornato`);
      } else {
        console.log(`Giocatore non trovato per l'asta ${auction._id}`);
      }
    }

    console.log("Terminazione delle aste attive completata");
  } catch (error) {
    console.error("Errore durante la terminazione delle aste attive:", error);
    throw error;
  } finally {
    console.timeEnd("endActiveAuctions");
  }
}

module.exports = { endActiveAuctions };
