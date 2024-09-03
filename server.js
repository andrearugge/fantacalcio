const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Importa le rotte dei partecipanti
const participantRoutes = require('./routes/participantRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const teamRoutes = require('./routes/teamRoutes');

const corsOptions = {
  origin: 'https://fantacalcio-fe.vercel.app',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Usa le rotte dei partecipanti
app.use('/api/participants', participantRoutes);

// Usa le rotte del team
app.use('/api/teams', teamRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));