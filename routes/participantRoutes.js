const express = require('express');
const router = express.Router();

let participantController;
try {
  participantController = require('../controllers/participantController');
} catch (error) {
  console.error('Error loading participantController:', error.message);
  participantController = {
    createParticipant: (req, res) => res.status(500).json({ error: 'Participant controller not available' }),
    getParticipantByLink: (req, res) => res.status(500).json({ error: 'Participant controller not available' })
  };
}

router.post('/', participantController.createParticipant);
router.get('/:uniqueLink', participantController.getParticipantByLink);
router.get('/', participantController.getAllParticipants);

// Optionally, you can add a catch-all route for undefined participant routes
router.use((req, res) => {
  res.status(404).json({ error: 'Participant route not found' });
});


module.exports = router;