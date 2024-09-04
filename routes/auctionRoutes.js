// routes/auctionRoutes.js
const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");

// Get all auctions
router.get("/", auctionController.getAllAuctions);

// Get a specific auction
router.get("/:id", auctionController.getAuctionById);

// Create a new auction
router.post("/", auctionController.createAuction);

// Start an auction
router.post("/:id/start", auctionController.startAuction);

// Place a bid
router.post("/:id/bid", auctionController.placeBid);

// End an auction
router.post("/:id/end", auctionController.endAuction);

module.exports = router;
