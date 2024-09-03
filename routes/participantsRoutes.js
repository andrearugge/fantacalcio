const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.post('/', participantController.createParticipant);
router.get('/:uniqueLink', participantController.getParticipantByLink);

module.exports = router;