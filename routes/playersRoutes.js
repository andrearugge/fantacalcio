// routes/playerRoutes.js
const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.createPlayer);
router.post("/upload", upload.single("file"), playerController.uploadCSV);

module.exports = router;
