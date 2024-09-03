// scripts/seedDatabase.js
const mongoose = require('mongoose');
const Team = require('../models/Team');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Crea alcune squadre di esempio
    await Team.create([
      { name: 'Andrea R', owner: '60a1b2c3d4e5f6a7b8c9d0e1' },
      { name: 'Castel', owner: '60a1b2c3d4e5f6a7b8c9d0e2' },
      { name: 'Piace', owner: '60a1b2c3d4e5f6a7b8c9d0e3' },
      { name: 'Jhonny', owner: '60a1b2c3d4e5f6a7b8c9d0e4' },
      { name: 'Volta', owner: '60a1b2c3d4e5f6a7b8c9d0e5' },
      { name: 'Ivan', owner: '60a1b2c3d4e5f6a7b8c9d0e6' },
      { name: 'Thomas', owner: '60a1b2c3d4e5f6a7b8c9d0e7' },
      { name: 'Beldu', owner: '60a1b2c3d4e5f6a7b8c9d0e8' },
    ]);

    console.log('Database seeded!');
    mongoose.connection.close();
  })
  .catch(err => console.error('Error seeding database:', err));