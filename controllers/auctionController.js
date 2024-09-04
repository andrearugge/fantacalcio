// controllers/auctionController.js
const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Participant = require('../models/Participant');

exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate('player').populate('winner');
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('player').populate('winner').populate('bids.participant');
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.json(auction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const { playerId, startTime, duration } = req.body;
        const player = await Player.findById(playerId);
        if (!player) return res.status(404).json({ message: 'Player not found' });

        const auction = new Auction({
            player: playerId,
            startTime: new Date(startTime),
            duration
        });

        const newAuction = await auction.save();
        res.status(201).json(newAuction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.startAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        auction.status = 'active';
        auction.startTime = new Date();
        await auction.save();

        // Emetti un evento socket per notificare i client
        req.app.get('io').emit('auctionStarted', { auction });

        res.json({ message: 'Auction started', auction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.placeBid = async (req, res) => {
    try {
        const { participantId, amount } = req.body;
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        const participant = await Participant.findById(participantId);
        if (!participant) return res.status(404).json({ message: 'Participant not found' });

        if (auction.placeBid(participantId, amount)) {
            await auction.save();
            
            // Emetti un evento socket per notificare i client
            req.app.get('io').emit('newBid', { auction, bid: { participantId, amount } });

            res.json({ message: 'Bid placed successfully', auction });
        } else {
            res.status(400).json({ message: 'Bid could not be placed' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.endAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        auction.conclude();
        await auction.save();

        // Emetti un evento socket per notificare i client
        req.app.get('io').emit('auctionEnded', { auction });

        res.json({ message: 'Auction ended', auction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};