const Player = require('./models/Player');

let currentAuction = null;
let auctionTimer = null;

function setupAuctionSocket(io) {
  io.on('connection', (socket) => {
    console.log('New client connected to auction');

    socket.on('startAuction', async (playerId) => {
      try {
        const player = await Player.findById(playerId);
        if (!player) {
          throw new Error('Player not found');
        }

        if (currentAuction) {
          throw new Error('An auction is already in progress');
        }

        currentAuction = {
          player: player,
          currentBid: 0,
          currentBidder: null,
          timeLeft: 20
        };

        io.emit('auctionStarted', { 
          player: player, 
          timeLeft: currentAuction.timeLeft,
          currentBid: currentAuction.currentBid
        });

        startAuctionTimer(io);
      } catch (error) {
        socket.emit('auctionError', error.message);
      }
    });

    socket.on('placeBid', (data) => {
      if (!currentAuction) {
        socket.emit('bidError', 'No auction in progress');
        return;
      }

      if (data.amount <= currentAuction.currentBid) {
        socket.emit('bidError', 'Bid must be higher than current bid');
        return;
      }

      currentAuction.currentBid = data.amount;
      currentAuction.currentBidder = data.userId;

      io.emit('bidUpdated', { 
        amount: currentAuction.currentBid, 
        bidder: currentAuction.currentBidder 
      });

      // Reset timer on new bid
      currentAuction.timeLeft = 20;
    });

    socket.on('getAuctionStatus', () => {
      socket.emit('auctionStatus', currentAuction);
    });
  });
}

function startAuctionTimer(io) {
  clearInterval(auctionTimer);
  auctionTimer = setInterval(() => {
    if (currentAuction) {
      currentAuction.timeLeft--;
      io.emit('timerUpdate', currentAuction.timeLeft);

      if (currentAuction.timeLeft <= 0) {
        endAuction(io);
      }
    }
  }, 1000);
}

function endAuction(io) {
  clearInterval(auctionTimer);
  if (currentAuction) {
    io.emit('auctionEnded', {
      player: currentAuction.player,
      winner: currentAuction.currentBidder,
      amount: currentAuction.currentBid
    });

    // Here you would typically update the database with the auction result
    // For example: updatePlayerAuctionResult(currentAuction);

    currentAuction = null;
  }
}

module.exports = setupAuctionSocket;