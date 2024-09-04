const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");

router.post("/placeBid", auctionController.placeBid);

module.exports = router;
