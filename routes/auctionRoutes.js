const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");

router.post("/start", auctionController.startAuction);
router.post("/bid", auctionController.placeBid);
router.get("/current", auctionController.getCurrentAuction);
router.get("/result/:id", auctionController.getAuctionResult);

module.exports = router;
